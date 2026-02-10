class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerAlive = true;
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
    this.totalEnemies = 12;  // 状态信号：敌人总数
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建12个敌人，分布在不同位置
    const positions = [
      { x: 100, y: 100 }, { x: 300, y: 100 }, { x: 500, y: 100 }, { x: 700, y: 100 },
      { x: 100, y: 250 }, { x: 300, y: 250 }, { x: 500, y: 250 }, { x: 700, y: 250 },
      { x: 100, y: 400 }, { x: 300, y: 400 }, { x: 500, y: 400 }, { x: 700, y: 400 }
    ];

    positions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.body.setBounce(0);
      
      // 为每个敌人设置自定义属性
      enemy.patrolSpeed = 120;
      enemy.chaseSpeed = 150;
      enemy.detectionRange = 150; // 检测范围
      enemy.isChasing = false;
      enemy.patrolDirection = (index % 2 === 0) ? 1 : -1; // 交替方向
      enemy.startX = pos.x;
      enemy.patrolRange = 100; // 巡逻范围
      
      // 设置初始巡逻速度
      enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
    });

    // 添加玩家与敌人的碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, '使用方向键移动 | 红色敌人会巡逻和追踪', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    if (!this.playerAlive) {
      return;
    }

    // 玩家移动控制
    const playerSpeed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 更新敌人行为
    this.enemiesChasing = 0;
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < enemy.detectionRange) {
        enemy.isChasing = true;
        this.enemiesChasing++;
        
        // 追踪玩家
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );
        
        this.physics.velocityFromRotation(
          angle,
          enemy.chaseSpeed,
          enemy.body.velocity
        );
        
        // 改变敌人颜色表示追踪状态（深红色）
        enemy.setTint(0xaa0000);
      } else {
        // 恢复巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          enemy.setVelocityY(0);
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
          enemy.clearTint();
        }

        // 巡逻逻辑：在起始位置左右移动
        if (enemy.x > enemy.startX + enemy.patrolRange) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        } else if (enemy.x < enemy.startX - enemy.patrolRange) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `玩家状态: ${this.playerAlive ? '存活' : '死亡'}`,
      `追踪中的敌人: ${this.enemiesChasing}/${this.totalEnemies}`,
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ]);
  }

  hitEnemy(player, enemy) {
    if (this.playerAlive) {
      this.playerAlive = false;
      player.setTint(0xff0000);
      player.setVelocity(0);
      
      // 停止所有敌人
      this.enemies.children.entries.forEach(e => {
        e.setVelocity(0);
      });

      this.add.text(400, 300, '游戏结束！', {
        fontSize: '48px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);

      // 3秒后重启
      this.time.delayedCall(3000, () => {
        this.scene.restart();
      });
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