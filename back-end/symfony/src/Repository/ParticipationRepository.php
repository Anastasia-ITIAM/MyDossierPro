<?php

namespace App\Repository;

use App\Entity\Participation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Participation>
 *
 * @method Participation|null find($id, $lockMode = null, $lockVersion = null)
 * @method Participation|null findOneBy(array $criteria, array $orderBy = null)
 * @method Participation[]    findAll()
 * @method Participation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ParticipationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Participation::class);
    }

    public function add(Participation $participation, bool $flush = true): void
    {
        $this->_em->persist($participation);
        if ($flush) {
            $this->_em->flush();
        }
    }

    public function remove(Participation $participation, bool $flush = true): void
    {
        $this->_em->remove($participation);
        if ($flush) {
            $this->_em->flush();
        }
    }

    /**
     * Récupère toutes les participations d'un utilisateur
     */
    public function findByUserId(int $userId): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.user_id = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('p.participation_date', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByTripId(int $tripId): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.trip_id = :tripId')
            ->setParameter('tripId', $tripId)
            ->orderBy('p.participation_date', 'ASC')
            ->getQuery()
            ->getResult();
    }
}