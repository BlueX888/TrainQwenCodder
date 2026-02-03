class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesActive = 0;
    this.playerHealth = 100;
    this.detectionRange = 150; // 敌人检测玩家的距离
    this.patrolSpeed = 80;
    this.chaseSpeed = 120;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成 15 个敌人
    const positions = [
      { x: 100, y: 100 }, { x: 300, y: 100 }, { x: 500, y: 100 },
      { x: 700, y: 100 }, { x: 150, y: 200 }, { x: 350, y: 200 },
      { x: 550, y: 200 }, { x: 650, y: 200 }, { x: 100, y: 400 },
      { x: 250, y: 400 }, { x: 400, y: 450 }, { x: 550, y: 400 },
      { x: 700, y: 400 }, { x: 200, y: 500 }, { x: 600, y: 500 }
    ];

    positions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 设置敌人初始状态
      enemy.patrolDirection = index % 2 === 0 ? 1 : -1; // 随机初始方向
      enemy.isChasing = false;
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
    });

    this.enemiesActive = this.enemies.getChildren().length;

    // 添加碰撞检测（可选：玩家碰到敌人减血）
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.updateInfoText();
  }

  update(time, delta) {
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

    // 敌人AI逻辑
    this.enemies.getChildren().forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      // 检测玩家是否在范围内
      if (distance < this.detectionRange) {
        // 追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
        }

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        enemy.setVelocity(
          Math.cos(angle) * this.chaseSpeed,
          Math.sin(angle) * this.chaseSpeed
        );

        // 改变敌人颜色表示追踪状态
        enemy.setTint(0xff6666);
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          enemy.clearTint();
        }

        // 检查是否碰到世界边界
        if (enemy.x <= 16 || enemy.x >= this.physics.world.bounds.width - 16) {
          enemy.patrolDirection *= -1;
        }

        // 保持水平巡逻
        enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        enemy.setVelocityY(0);
      }
    });

    this.updateInfoText();
  }

  hitEnemy(player, enemy) {
    // 玩家碰到敌人减血（可选效果）
    if (this.playerHealth > 0) {
      this.playerHealth = Math.max(0, this.playerHealth - 0.5);
    }
  }

  updateInfoText() {
    const chasingCount = this.enemies.getChildren().filter(e => e.isChasing).length;
    this.infoText.setText([
      `Enemies Active: ${this.enemiesActive}`,
      `Chasing: ${chasingCount}`,
      `Player Health: ${this.playerHealth.toFixed(0)}`,
      `Controls: Arrow Keys`,
      `Tip: Get close to enemies to trigger chase mode`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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