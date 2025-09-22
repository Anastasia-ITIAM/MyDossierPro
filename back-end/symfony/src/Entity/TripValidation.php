<?php

namespace App\Entity;

use App\Repository\TripValidationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TripValidationRepository::class)]
class TripValidation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $trip_id = null;

    #[ORM\Column]
    private ?int $user_id = null;

    #[ORM\Column(length: 255)]
    private ?string $status = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $comment = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $validation_date = null;

    #[ORM\Column(nullable: true)]
    private ?int $rating = null;

    #[ORM\Column(length: 255)]
    private ?string $employee_validation = null;

    public function getId(): ?int { return $this->id; }
    public function setId(int $id): static { $this->id = $id; return $this; }

    public function getTripId(): ?int { return $this->trip_id; }
    public function setTripId(int $trip_id): static { $this->trip_id = $trip_id; return $this; }

    public function getUserId(): ?int { return $this->user_id; }
    public function setUserId(int $user_id): static { $this->user_id = $user_id; return $this; }

    public function getStatus(): ?string { return $this->status; }
    public function setStatus(string $status): static { $this->status = $status; return $this; }

    public function getComment(): ?string { return $this->comment; }
    public function setComment(?string $comment): static { $this->comment = $comment; return $this; }

    public function getValidationDate(): ?\DateTime { return $this->validation_date; }
    public function setValidationDate(?\DateTime $validation_date): static { $this->validation_date = $validation_date; return $this; }

    public function getRating(): ?int { return $this->rating; }
    public function setRating(?int $rating): static { $this->rating = $rating; return $this; }

    public function getEmployeeValidation(): ?string { return $this->employee_validation; }
    public function setEmployeeValidation(string $employee_validation): static { $this->employee_validation = $employee_validation; return $this; }
}
