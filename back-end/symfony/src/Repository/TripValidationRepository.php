<?php

namespace App\Repository;

use App\Entity\TripValidation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TripValidation>
 *
 * @method TripValidation|null find($id, $lockMode = null, $lockVersion = null)
 * @method TripValidation|null findOneBy(array $criteria, array $orderBy = null)
 * @method TripValidation[]    findAll()
 * @method TripValidation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TripValidationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TripValidation::class);
    }

    public function add(TripValidation $tripValidation, bool $flush = true): void
    {
        $this->_em->persist($tripValidation);
        if ($flush) {
            $this->_em->flush();
        }
    }

    public function remove(TripValidation $tripValidation, bool $flush = true): void
    {
        $this->_em->remove($tripValidation);
        if ($flush) {
            $this->_em->flush();
        }
    }

    /**
     * Récupère toutes les validations d'un utilisateur
     */
    public function findByUserId(int $userId): array
    {
        return $this->createQueryBuilder('tv')
            ->andWhere('tv.user_id = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('tv.validation_date', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Récupère toutes les validations pour un trajet donné
     */
    public function findByTripId(int $tripId): array
    {
        return $this->createQueryBuilder('tv')
            ->andWhere('tv.trip_id = :tripId')
            ->setParameter('tripId', $tripId)
            ->orderBy('tv.validation_date', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByStatus(string $status): array
    {
        return $this->createQueryBuilder('tv')
            ->andWhere('tv.status = :status')
            ->setParameter('status', $status)
            ->orderBy('tv.validation_date', 'ASC')
            ->getQuery()
            ->getResult();
    }
}