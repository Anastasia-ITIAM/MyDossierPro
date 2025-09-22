<?php

namespace App\Repository;

use App\Entity\Trip;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Trip>
 *
 * @method Trip|null find($id, $lockMode = null, $lockVersion = null)
 * @method Trip|null findOneBy(array $criteria, array $orderBy = null)
 * @method Trip[]    findAll()
 * @method Trip[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TripRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Trip::class);
    }

    public function add(Trip $trip, bool $flush = true): void
    {
        $this->_em->persist($trip);
        if ($flush) {
            $this->_em->flush();
        }
    }

    public function remove(Trip $trip, bool $flush = true): void
    {
        $this->_em->remove($trip);
        if ($flush) {
            $this->_em->flush();
        }
    }

    /**
     * Récupère tous les trajets d’un utilisateur
     */
    public function findByUserId(int $userId): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.user = :userId') // relation User
            ->setParameter('userId', $userId)
            ->orderBy('t.departureDate', 'ASC')
            ->addOrderBy('t.departureTime', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Récupère les trajets à venir d’un utilisateur
     */
    public function findUpcomingTrips(int $userId): array
    {
        $now = new \DateTime();

        return $this->createQueryBuilder('t')
            ->andWhere('t.user = :userId')
            ->andWhere('t.departureDate > :today OR (t.departureDate = :today AND t.departureTime > :time)')
            ->setParameter('userId', $userId)
            ->setParameter('today', $now->format('Y-m-d'))
            ->setParameter('time', $now->format('H:i'))
            ->orderBy('t.departureDate', 'ASC')
            ->addOrderBy('t.departureTime', 'ASC')
            ->getQuery()
            ->getResult();
    }
}