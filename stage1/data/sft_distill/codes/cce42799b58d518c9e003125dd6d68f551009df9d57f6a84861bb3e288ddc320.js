class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesPatrolling = 0;
    this.enemiesChasing = 0;
    this.playerSpeed = 200;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建15个敌人，分布在不同位置
    for (let i = 0; i < 15; i++) {
      const x = 100 + (i % 5) * 150;
      const y = 100 + Math.floor(i / 5) * 150;
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 设置敌人属性
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 自定义属性：巡逻状态和方向
      enemy.patrolling = true;
      enemy.patrolDirection = i % 2 === 0 ? 1 : -1; // 交替方向
      enemy.setVelocityX(120 * enemy.patrolDirection);
      enemy.detectionRange = 150; // 检测范围
      enemy.chaseSpeed = 150; // 追踪速度
    }

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 说明文本
    this.add.text(10, 560, 'Arrow Keys: Move Player | Blue enemies patrol and chase when close', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 重置计数器
    this.enemiesPatrolling = 0;
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 检测玩家是否在范围内
      if (distance < enemy.detectionRange) {
        // 追踪模式
        enemy.patrolling = false;
        this.enemiesChasing++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置追踪速度
        this.physics.velocityFromRotation(angle, enemy.chaseSpeed, enemy.body.velocity);

        // 视觉反馈：追踪时稍微放大
        enemy.setScale(1.2);
        enemy.setTint(0x8888ff);
      } else {
        // 巡逻模式
        if (!enemy.patrolling) {
          // 从追踪切换回巡逻
          enemy.patrolling = true;
          enemy.setVelocityY(0);
          enemy.setVelocityX(120 * enemy.patrolDirection);
        }
        this.enemiesPatrolling++;

        // 恢复原始大小和颜色
        enemy.setScale(1);
        enemy.clearTint();

        // 巡逻边界检测
        if (enemy.x <= 24 && enemy.body.velocity.x < 0) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(120);
        } else if (enemy.x >= 776 && enemy.body.velocity.x > 0) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(-120);
        }
      }
    });

    // 更新状态文本
    this.statusText.setText([
      `Enemies: 15 total`,
      `Patrolling: ${this.enemiesPatrolling}`,
      `Chasing: ${this.enemiesChasing}`,
      `Player Pos: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ]);
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