<?php

namespace App\Entity;

use App\Repository\TripRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Entity\User;
use App\Entity\Car;

#[ORM\Entity(repositoryClass: TripRepository::class)]
class Trip
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // Relation ManyToOne avec Car
    #[ORM\ManyToOne(targetEntity: Car::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Car $car = null;

    // Relation ManyToOne avec User (conducteur)
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $driver = null;

    #[ORM\Column(length: 255)]
    private ?string $departure_address = null;

    #[ORM\Column(length: 255)]
    private ?string $arrival_address = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $departure_date = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    private ?\DateTime $departure_time = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    private ?\DateTime $arrival_time = null;

    #[ORM\Column]
    private ?int $available_seats = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $price = 0;

    #[ORM\Column]
    private ?bool $eco_friendly = null;

    #[ORM\Column(length: 255)]
    private ?string $status = null;

    #[ORM\Column(nullable: true)]
    private ?bool $finished = null;

    #[ORM\Column(nullable: true)]
    private ?bool $participant_validation = null;

    // Relation ManyToMany avec passagers
    #[ORM\ManyToMany(targetEntity: User::class)]
    #[ORM\JoinTable(name: 'trip_passengers')]
    private Collection $passengers;

    public function __construct()
    {
        $this->passengers = new ArrayCollection();
        $this->eco_friendly = false;
        $this->finished = false;
        $this->participant_validation = false;
    }

    // GETTERS ET SETTERS
    public function getId(): ?int { return $this->id; }

    public function getCar(): ?Car { return $this->car; }
    public function setCar(?Car $car): static { $this->car = $car; return $this; }

    public function getDriver(): ?User { return $this->driver; }
    public function setDriver(?User $driver): static { $this->driver = $driver; return $this; }

    public function getUser(): ?User { return $this->getDriver(); }
    public function setUser(?User $user): static { return $this->setDriver($user); }

    public function getDepartureAddress(): ?string { return $this->departure_address; }
    public function setDepartureAddress(string $departure_address): static { $this->departure_address = $departure_address; return $this; }

    public function getArrivalAddress(): ?string { return $this->arrival_address; }
    public function setArrivalAddress(string $arrival_address): static { $this->arrival_address = $arrival_address; return $this; }

    public function getDepartureDate(): ?\DateTime { return $this->departure_date; }
    public function setDepartureDate(\DateTime $departure_date): static { $this->departure_date = $departure_date; return $this; }

    public function getDepartureTime(): ?\DateTime { return $this->departure_time; }
    public function setDepartureTime(\DateTime $departure_time): static { $this->departure_time = $departure_time; return $this; }

    public function getArrivalTime(): ?\DateTime { return $this->arrival_time; }
    public function setArrivalTime(\DateTime $arrival_time): static { $this->arrival_time = $arrival_time; return $this; }

    public function getAvailableSeats(): ?int { return $this->available_seats; }
    public function setAvailableSeats(int $available_seats): static { $this->available_seats = $available_seats; return $this; }

    public function getPrice(): ?int { return $this->price; }
    public function setPrice(int $price): static { $this->price = $price; return $this; }

    public function isEcoFriendly(): ?bool { return $this->eco_friendly; }
    public function setEcoFriendly(bool $eco_friendly): static { $this->eco_friendly = $eco_friendly; return $this; }

    public function getStatus(): ?string { return $this->status; }
    public function setStatus(string $status): static { $this->status = $status; return $this; }

    public function isFinished(): ?bool { return $this->finished; }
    public function setFinished(?bool $finished): static { $this->finished = $finished; return $this; }

    public function isParticipantValidation(): ?bool { return $this->participant_validation; }
    public function setParticipantValidation(?bool $participant_validation): static { $this->participant_validation = $participant_validation; return $this; }

    // Passagers
    /** @return Collection|User[] */
    public function getPassengers(): Collection { return $this->passengers; }

    public function addPassenger(User $user): static
    {
        if (!$this->passengers->contains($user)) {
            $this->passengers->add($user);
        }
        return $this;
    }

    public function removePassenger(User $user): static
    {
        $this->passengers->removeElement($user);
        return $this;
    }
}
