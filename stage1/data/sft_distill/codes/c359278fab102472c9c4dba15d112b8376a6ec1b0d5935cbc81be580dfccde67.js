class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
    this.playerAlive = true; // 状态信号：玩家存活状态
    this.totalEnemies = 20; // 状态信号：敌人总数
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建20个敌人，随机分布
    for (let i = 0; i < this.totalEnemies; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 设置敌人的巡逻属性
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 自定义属性：巡逻模式
      enemy.patrolSpeed = 80;
      enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // 随机初始方向
      enemy.patrolMinX = x - 150; // 巡逻左边界
      enemy.patrolMaxX = x + 150; // 巡逻右边界
      enemy.isChasing = false; // 是否正在追踪
      
      // 设置初始巡逻速度
      enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
    }

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, '使用方向键移动玩家 | 蓝色=玩家 黄色=敌人', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update() {
    if (!this.playerAlive) return;

    // 玩家控制
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 重置追踪计数
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, 
        this.player.y, 
        enemy.x, 
        enemy.y
      );

      const detectionRange = 200; // 检测范围

      if (distance < detectionRange) {
        // 追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
        }
        this.enemiesChasing++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, 
          enemy.y, 
          this.player.x, 
          this.player.y
        );

        // 设置追踪速度（比巡逻稍快）
        const chaseSpeed = 120;
        enemy.setVelocity(
          Math.cos(angle) * chaseSpeed,
          Math.sin(angle) * chaseSpeed
        );
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          // 恢复巡逻速度
          enemy.setVelocityY(0);
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        }

        // 检查巡逻边界
        if (enemy.x <= enemy.patrolMinX && enemy.patrolDirection === -1) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        } else if (enemy.x >= enemy.patrolMaxX && enemy.patrolDirection === 1) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        }
      }
    });

    // 更新状态文本
    this.statusText.setText([
      `敌人总数: ${this.totalEnemies}`,
      `正在追踪: ${this.enemiesChasing}`,
      `玩家状态: ${this.playerAlive ? '存活' : '死亡'}`,
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
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