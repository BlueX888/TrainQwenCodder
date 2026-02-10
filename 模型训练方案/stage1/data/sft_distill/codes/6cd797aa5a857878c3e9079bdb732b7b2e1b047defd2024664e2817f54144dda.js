class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.ENEMY_SPEED = 160;
    this.CHASE_DISTANCE = 200;
    this.PLAYER_SPEED = 200;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成15个敌人，分布在不同位置
    const positions = [
      { x: 100, y: 100 }, { x: 300, y: 100 }, { x: 500, y: 100 },
      { x: 700, y: 100 }, { x: 150, y: 200 }, { x: 350, y: 200 },
      { x: 550, y: 200 }, { x: 750, y: 200 }, { x: 100, y: 400 },
      { x: 300, y: 400 }, { x: 500, y: 400 }, { x: 700, y: 400 },
      { x: 200, y: 500 }, { x: 400, y: 500 }, { x: 600, y: 500 }
    ];

    for (let i = 0; i < 15; i++) {
      const enemy = this.enemies.create(positions[i].x, positions[i].y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 0);
      
      // 为每个敌人设置自定义数据
      enemy.setData('patrolLeft', positions[i].x - 100);
      enemy.setData('patrolRight', positions[i].x + 100);
      enemy.setData('isChasing', false);
      enemy.setData('enemyId', i);
      
      // 随机初始方向
      const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      enemy.setVelocityX(this.ENEMY_SPEED * direction);
    }

    // 初始化信号对象
    window.__signals__ = {
      player: { x: 0, y: 0 },
      enemies: [],
      chasingCount: 0,
      patrollingCount: 0,
      frameCount: 0
    };

    // 添加文本显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.PLAYER_SPEED);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.PLAYER_SPEED);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.PLAYER_SPEED);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.PLAYER_SPEED);
    }

    // 更新敌人行为
    let chasingCount = 0;
    let patrollingCount = 0;
    const enemyStates = [];

    this.enemies.children.entries.forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      const patrolLeft = enemy.getData('patrolLeft');
      const patrolRight = enemy.getData('patrolRight');
      const enemyId = enemy.getData('enemyId');

      if (distance < this.CHASE_DISTANCE) {
        // 追踪模式
        enemy.setData('isChasing', true);
        chasingCount++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        enemy.setVelocity(
          Math.cos(angle) * this.ENEMY_SPEED,
          Math.sin(angle) * this.ENEMY_SPEED
        );

        enemyStates.push({
          id: enemyId,
          state: 'chasing',
          x: Math.round(enemy.x),
          y: Math.round(enemy.y),
          distance: Math.round(distance)
        });
      } else {
        // 巡逻模式
        enemy.setData('isChasing', false);
        patrollingCount++;

        // 左右巡逻
        if (enemy.x <= patrolLeft && enemy.body.velocity.x < 0) {
          enemy.setVelocityX(this.ENEMY_SPEED);
        } else if (enemy.x >= patrolRight && enemy.body.velocity.x > 0) {
          enemy.setVelocityX(-this.ENEMY_SPEED);
        }

        // 保持Y轴速度为0（仅左右移动）
        enemy.setVelocityY(0);

        enemyStates.push({
          id: enemyId,
          state: 'patrolling',
          x: Math.round(enemy.x),
          y: Math.round(enemy.y),
          distance: Math.round(distance)
        });
      }
    });

    // 更新信号
    window.__signals__.player = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.enemies = enemyStates;
    window.__signals__.chasingCount = chasingCount;
    window.__signals__.patrollingCount = patrollingCount;
    window.__signals__.frameCount++;

    // 更新调试文本
    this.debugText.setText([
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Chasing: ${chasingCount}`,
      `Patrolling: ${patrollingCount}`,
      `Frame: ${window.__signals__.frameCount}`,
      `Use Arrow Keys to Move`
    ]);

    // 每60帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        timestamp: Date.now(),
        player: window.__signals__.player,
        chasingCount: window.__signals__.chasingCount,
        patrollingCount: window.__signals__.patrollingCount,
        totalEnemies: 15
      }));
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);