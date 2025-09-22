<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/user')]
class UserController extends AbstractController
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    // INSCRIPTION UTILISATEUR

    #[Route('', name: 'create_user', methods: ['POST'])]
    public function create(
        Request $request,
        ValidatorInterface $validator,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        try {
            // Récupération et décodage des données JSON envoyées par le front
            $data = json_decode($request->getContent(), true);

            $user = new User();
            $user->setEmail($data['email'] ?? '');
            $user->setPseudo($data['pseudo'] ?? '');
            $user->setCredits($data['credits'] ?? 20);
            $user->setRole('ROLE_PASSENGER');
            $user->setCreatedAt(new \DateTime());
            $user->setStatus($data['status'] ?? 'active');

            // Hash du mot de passe
            if (!empty($data['password'])) {
                $user->setPassword($passwordHasher->hashPassword($user, $data['password']));
            }

            // Validation Symfony (email, pseudo, etc.)
            $errors = $validator->validate($user);
            if (count($errors) > 0) {
                $messages = [];
                foreach ($errors as $error) {
                    $messages[] = $error->getMessage();
                }
                return new JsonResponse(['success' => false, 'message' => $messages], 400);
            }

            // Vérification unicité email/pseudo
            if ($this->em->getRepository(User::class)->findOneBy(['email' => $user->getEmail()])) {
                return new JsonResponse(['success' => false, 'message' => 'Cet email est déjà utilisé'], 409);
            }
            if ($this->em->getRepository(User::class)->findOneBy(['pseudo' => $user->getPseudo()])) {
                return new JsonResponse(['success' => false, 'message' => 'Ce pseudo est déjà utilisé'], 409);
            }

            // Persistance en base
            $this->em->persist($user);
            $this->em->flush();

            return new JsonResponse([
                'success' => true,
                'message' => 'Utilisateur créé',
                'user_id' => $user->getId()
            ], 201);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // LISTER TOUS LES UTILISATEURS

    #[Route('', name: 'get_users', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $users = $this->em->getRepository(User::class)->findAll();

        // Préparer uniquement les données sûres à exposer (pas de mot de passe)
        $data = array_map(fn(User $u) => [
            'id' => $u->getId(),
            'pseudo' => $u->getPseudo(),
            'email' => $u->getEmail(),
            'credits' => $u->getCredits(),
            'role' => $u->getRole(),
            'status' => $u->getStatus(),
            'createdAt' => $u->getCreatedAt()->format('Y-m-d H:i:s')
        ], $users);

        return new JsonResponse(['success' => true, 'users' => $data]);
    }

    // AFFICHER UN UTILISATEUR

    #[Route('/{id}', name: 'get_user', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);
        if (!$user) {
            return new JsonResponse(['success' => false, 'message' => 'Utilisateur non trouvé'], 404);
        }

        return new JsonResponse([
            'success' => true,
            'user' => [
                'id' => $user->getId(),
                'pseudo' => $user->getPseudo(),
                'email' => $user->getEmail(),
                'credits' => $user->getCredits(),
                'role' => $user->getRole(),
                'status' => $user->getStatus(),
                'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s')
            ]
        ]);
    }

    // MODIFIER UN UTILISATEUR (PUT ou POST)

    #[Route('/{id}', name: 'update_user', methods: ['POST', 'PUT'])]
    public function update(
        int $id,
        Request $request,
        UserPasswordHasherInterface $passwordHasher
        ): JsonResponse {
            try {
            $user = $this->em->getRepository(User::class)->find($id);
            if (!$user) {
                return new JsonResponse(['success' => false, 'message' => 'Utilisateur non trouvé'], 404);
            }

        $data = $request->request->all();

        // Vérifications unicité email/pseudo

        if (isset($data['email'])) {
            $existingEmailUser = $this->em->getRepository(User::class)
                ->findOneBy(['email' => $data['email']]);
            if ($existingEmailUser && $existingEmailUser->getId() !== $user->getId()) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Email déjà utilisé'
                ], 400);
            }
        }

        if (isset($data['pseudo'])) {
            $existingPseudoUser = $this->em->getRepository(User::class)
                ->findOneBy(['pseudo' => $data['pseudo']]);
            if ($existingPseudoUser && $existingPseudoUser->getId() !== $user->getId()) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Pseudo déjà utilisé'
                ], 400);
            }
        }

        // Mises à jour sécurisées

        if (isset($data['email'])) $user->setEmail($data['email']);
        if (isset($data['pseudo'])) $user->setPseudo($data['pseudo']);
        if (isset($data['firstName'])) $user->setFirstName($data['firstName']);
        if (isset($data['lastName'])) $user->setLastName($data['lastName']);
        if (isset($data['birthDate']) && $data['birthDate'] !== '') {
            $user->setBirthDate(new \DateTime($data['birthDate']));
        }
        if (isset($data['postalAddress'])) $user->setPostalAddress($data['postalAddress']);
        if (isset($data['phone'])) $user->setPhone($data['phone']);
        if (isset($data['password']) && $data['password'] !== '') {
            $user->setPassword($passwordHasher->hashPassword($user, $data['password']));
        }

        // Upload photo
        $file = $request->files->get('photo_profil');
        if ($file) {
            $fileName = uniqid() . '.' . $file->guessExtension();
            $file->move($this->getParameter('profiles_directory'), $fileName);
            $user->setProfilePhotoUrl('/uploads/profiles/' . $fileName);
        }

        $this->em->persist($user);
        $this->em->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'Profil mis à jour',
            'user' => [
                'id' => $user->getId(),
                'pseudo' => $user->getPseudo(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'birthDate' => $user->getBirthDate()?->format('Y-m-d'),
                'postalAddress' => $user->getPostalAddress(),
                'phone' => $user->getPhone(),
                'profilePhotoUrl' => $user->getProfilePhotoUrl(),
            ]
        ]);

    } catch (\Exception $e) {
        return new JsonResponse([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}

    // SUPPRIMER UN UTILISATEUR
    
    #[Route('/{id}', name: 'delete_user', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);
        if (!$user) {
            return new JsonResponse(['success' => false, 'message' => 'Utilisateur non trouvé'], 404);
        }

        $this->em->remove($user);
        $this->em->flush();

        return new JsonResponse(['success' => true, 'message' => 'Utilisateur supprimé']);
    }
}
