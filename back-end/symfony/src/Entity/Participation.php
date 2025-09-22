<?php

namespace App\Entity;

use App\Repository\ParticipationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ParticipationRepository::class)]
class Participation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $user_id = null;

    #[ORM\Column]
    private ?int $trip_id = null;

    #[ORM\Column]
    private ?\DateTime $participation_date = null;

    #[ORM\Column(nullable: true)]
    private ?bool $is_valid = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getUserId(): ?int
    {
        return $this->user_id;
    }

    public function setUserId(int $user_id): static
    {
        $this->user_id = $user_id;

        return $this;
    }

    public function getTripId(): ?int
    {
        return $this->trip_id;
    }

    public function setTripId(int $trip_id): static
    {
        $this->trip_id = $trip_id;

        return $this;
    }

    public function getParticipationDate(): ?\DateTime
    {
        return $this->participation_date;
    }

    public function setParticipationDate(\DateTime $participation_date): static
    {
        $this->participation_date = $participation_date;

        return $this;
    }

    public function isValid(): ?bool
    {
        return $this->is_valid;
    }

    public function setIsValid(?bool $is_valid): static
    {
        $this->is_valid = $is_valid;

        return $this;
    }
}