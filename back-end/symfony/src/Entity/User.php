<?php

namespace App\Entity;

use App\Repository\UserRepository;
use App\Entity\Car;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Validator\Constraints as Assert;


#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id, ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank(message: "Le pseudo est obligatoire.")]
    #[Assert\Length(
        min: 3, max: 20,
        minMessage: "Le pseudo doit contenir au moins {{ limit }} caractères.",
        maxMessage: "Le pseudo ne peut pas dépasser {{ limit }} caractères."
    )]
    #[Assert\Regex(
        pattern: '/^[a-zA-Z0-9_]+$/',
        message: "Le pseudo ne peut contenir que des lettres, chiffres et underscore."
    )]
    private ?string $pseudo = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $firstName = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $lastName = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTime $birthDate = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $postalAddress = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(length: 100, unique: true)]
    #[Assert\NotBlank(message: "L'email est obligatoire.")]
    #[Assert\Email(message: "Email invalide.")]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: "Le mot de passe est obligatoire.")]
    #[Assert\Length(
        min: 8,
        minMessage: "Le mot de passe doit contenir au moins {{ limit }} caractères."
    )]
    private ?string $password = null;

    #[ORM\Column]
    private ?int $credits = 20;

    #[ORM\Column(length: 255)]
    private ?string $role = 'ROLE_PASSENGER';

    #[ORM\Column]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $profilePhotoUrl = null;

    #[ORM\Column(length: 255)]
    private ?string $status = 'active';

#[ORM\OneToMany(targetEntity: Car::class, mappedBy: 'user', cascade: ['persist', 'remove'])]
    private Collection $cars;

    public function __construct()
    {
        $this->cars = new ArrayCollection();
    }

    // GETTERS ET SETTERS 

    public function getId(): ?int { return $this->id; }
    public function getPseudo(): ?string { return $this->pseudo; }
    public function setPseudo(string $pseudo): static { $this->pseudo = $pseudo; return $this; }
    public function getFirstName(): ?string { return $this->firstName; }
    public function setFirstName(?string $firstName): static { $this->firstName = $firstName; return $this; }
    public function getLastName(): ?string { return $this->lastName; }
    public function setLastName(?string $lastName): static { $this->lastName = $lastName; return $this; }
    public function getBirthDate(): ?\DateTime { return $this->birthDate; }
    public function setBirthDate(?\DateTime $birthDate): static { $this->birthDate = $birthDate; return $this; }
    public function getPostalAddress(): ?string { return $this->postalAddress; }
    public function setPostalAddress(?string $postalAddress): static { $this->postalAddress = $postalAddress; return $this; }
    public function getPhone(): ?string { return $this->phone; }
    public function setPhone(?string $phone): static { $this->phone = $phone; return $this; }
    public function getEmail(): ?string { return $this->email; }
    public function setEmail(string $email): static { $this->email = $email; return $this; }
    public function getPassword(): ?string { return $this->password; }
    public function setPassword(string $password): static { $this->password = $password; return $this; }
    public function getCredits(): ?int { return $this->credits; }
    public function setCredits(int $credits): static { $this->credits = $credits; return $this; }
    public function getRole(): ?string { return $this->role; }
    public function setRole(string $role): static { $this->role = $role; return $this; }
    public function getCreatedAt(): ?\DateTime { return $this->createdAt; }
    public function setCreatedAt(\DateTime $createdAt): static { $this->createdAt = $createdAt; return $this; }
    public function getProfilePhotoUrl(): ?string { return $this->profilePhotoUrl; }
    public function setProfilePhotoUrl(?string $profilePhotoUrl): static { $this->profilePhotoUrl = $profilePhotoUrl; return $this; }
    public function getStatus(): ?string { return $this->status; }
    public function setStatus(string $status): static { $this->status = $status; return $this; }

    // SECURITY METHODS 
    public function getUserIdentifier(): string { return (string)$this->email; }
    public function getRoles(): array { return [$this->role ?? 'ROLE_PASSENGER']; }
    public function eraseCredentials(): void {}

    //  CARS RELATION 
    public function getCars(): Collection { return $this->cars; }

    public function addCar(Car $car): static
    {
        if (!$this->cars->contains($car)) {
            $this->cars->add($car);
            $car->setUser($this);
        }
        return $this;
    }

    public function removeCar(Car $car): static
    {
        if ($this->cars->removeElement($car)) {
            if ($car->getUser() === $this) {
                $car->setUser(null);
            }
        }
        return $this;
    }
}