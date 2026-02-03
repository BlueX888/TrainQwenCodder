class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.trackingCount = 0; // 状态信号：当前追踪玩家的敌人数量
    this.totalEnemies = 15; // 状态信号：敌人总数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillRect(0, 0, 24, 24);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成15个敌人，分布在场景中
    for (let i = 0; i < this.totalEnemies; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
      
      // 设置初始巡逻方向（随机向左或向右）
      enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      enemy.setVelocityX(200 * enemy.patrolDirection);
      
      // 设置巡逻边界
      enemy.patrolLeft = x - 150;
      enemy.patrolRight = x + 150;
      
      // 敌人状态：'patrol' 或 'tracking'
      enemy.state = 'patrol';
    }

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 570, 'Use Arrow Keys to Move | Enemies chase when close', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    // 玩家移动控制
    const playerSpeed = 250;
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

    // 重置追踪计数
    this.trackingCount = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      const detectionRange = 150; // 检测范围

      if (distance < detectionRange) {
        // 追踪模式
        enemy.state = 'tracking';
        this.trackingCount++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置速度朝向玩家
        const speed = 200;
        enemy.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );

        // 改变颜色表示追踪状态（红色）
        enemy.setTint(0xff0000);
      } else {
        // 巡逻模式
        enemy.state = 'patrol';
        enemy.clearTint();

        // 检查是否到达巡逻边界
        if (enemy.x <= enemy.patrolLeft) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(200 * enemy.patrolDirection);
          enemy.setVelocityY(0);
        } else if (enemy.x >= enemy.patrolRight) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(200 * enemy.patrolDirection);
          enemy.setVelocityY(0);
        }

        // 保持Y轴速度为0（纯水平巡逻）
        if (Math.abs(enemy.body.velocity.y) > 0) {
          enemy.setVelocityY(0);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText(
      `Enemies: ${this.totalEnemies} | Tracking: ${this.trackingCount} | Patrolling: ${this.totalEnemies - this.trackingCount}`
    );
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