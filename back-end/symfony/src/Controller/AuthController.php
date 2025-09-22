<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    private EntityManagerInterface $em;
    private JWTTokenManagerInterface $jwtManager;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(
        EntityManagerInterface $em,
        JWTTokenManagerInterface $jwtManager,
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->em = $em;
        $this->jwtManager = $jwtManager;
        $this->passwordHasher = $passwordHasher;
    }

    // ------------------- LOGIN -------------------
    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Email et mot de passe requis'
            ], 400);
        }

        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user || !$this->passwordHasher->isPasswordValid($user, $password)) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Identifiants invalides'
            ], 401);
        }

        // Génération du JWT avec infos utiles (pas de mot de passe)
        $payload = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'role' => $user->getRole(),
            'pseudo' => $user->getPseudo(),
            'credits' => $user->getCredits(),
            'status' => $user->getStatus(),
        ];

        $token = $this->jwtManager->create($user, $payload);

        return new JsonResponse([
            'success' => true,
            'token' => $token
        ]);
    }

    // ------------------- UTILISATEUR CONNECTÉ -------------------
    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user || !$user instanceof User) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Non autorisé'
            ], 401);
        }

        return new JsonResponse([
            'success' => true,
            'user' => [
                'id' => $user->getId(),
                'pseudo' => $user->getPseudo(),
                'email' => $user->getEmail(),
                'role' => $user->getRole(),
                'credits' => $user->getCredits(),
                'status' => $user->getStatus(),
            ]
        ]);
    }
}
