<?php

namespace App\Entity;

use App\Repository\CarRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\User;

#[ORM\Entity(repositoryClass: CarRepository::class)]
class Car
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20)]
    private ?string $licensePlate = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $registrationDate = null;

    #[ORM\Column(length: 50)]
    private ?string $model = null;

    #[ORM\Column(length: 50)]
    private ?string $brand = null;

    #[ORM\Column(length: 30)]
    private ?string $color = null;

    #[ORM\Column(length: 255)]
    private ?string $fuelType = null;

    #[ORM\Column(options: ['default' => 1])]
    private ?int $availableSeats = 1;

    #[ORM\Column(type: Types::STRING, length: 255, nullable: true)]
    private ?string $customPreferences = null;

    #[ORM\ManyToOne(inversedBy: 'cars')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    // CONSTRUCTEUR 
    public function __construct()
    {
        $this->availableSeats = 1; 
    }

    // GETTERS ET SETTERS 
    public function getId(): ?int { return $this->id; }

    public function getLicensePlate(): ?string { return $this->licensePlate; }
    public function setLicensePlate(string $licensePlate): static { $this->licensePlate = $licensePlate; return $this; }

    public function getRegistrationDate(): ?\DateTime { return $this->registrationDate; }
    public function setRegistrationDate(\DateTime $registrationDate): static { $this->registrationDate = $registrationDate; return $this; }

    public function getModel(): ?string { return $this->model; }
    public function setModel(string $model): static { $this->model = $model; return $this; }

    public function getBrand(): ?string { return $this->brand; }
    public function setBrand(string $brand): static { $this->brand = $brand; return $this; }

    public function getColor(): ?string { return $this->color; }
    public function setColor(string $color): static { $this->color = $color; return $this; }

    public function getFuelType(): ?string { return $this->fuelType; }
    public function setFuelType(string $fuelType): static { $this->fuelType = $fuelType; return $this; }

    public function getAvailableSeats(): ?int { return $this->availableSeats; }
    public function setAvailableSeats(int $availableSeats): static { $this->availableSeats = $availableSeats; return $this; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getCustomPreferences(): ?string { return $this->customPreferences; }
    public function setCustomPreferences(?string $customPreferences): static { $this->customPreferences = $customPreferences; return $this; }
}
