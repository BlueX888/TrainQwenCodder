class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0; // 状态信号：存活时间（秒）
    this.collisionCount = 0; // 状态信号：碰撞次数
    this.isAlive = true; // 状态信号：是否存活
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（紫色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9b59b6, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（随机位置）
    const enemyX = Phaser.Math.Between(50, 750);
    const enemyY = Phaser.Math.Between(50, 550);
    this.enemy = this.physics.add.sprite(enemyX, enemyY, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 添加信息文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, '使用方向键移动 | 玩家速度: 360 | 敌人速度: 300', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    // 初始化计时器
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (!this.isAlive) {
      return;
    }

    // 更新存活时间
    this.survivalTime = ((time - this.startTime) / 1000).toFixed(1);

    // 更新信息显示
    this.infoText.setText(
      `存活时间: ${this.survivalTime}s | 碰撞次数: ${this.collisionCount} | 状态: ${this.isAlive ? '存活' : '死亡'}`
    );

    // 玩家移动控制（速度 300 * 1.2 = 360）
    const playerSpeed = 360;
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

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家（速度 300）
    const enemySpeed = 300;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);
  }

  handleCollision(player, enemy) {
    // 增加碰撞计数
    this.collisionCount++;

    // 碰撞3次后游戏结束
    if (this.collisionCount >= 3) {
      this.isAlive = false;
      player.setTint(0xff0000);
      player.setVelocity(0);
      enemy.setVelocity(0);

      // 显示游戏结束文本
      this.add.text(400, 300, 'GAME OVER', {
        fontSize: '48px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);

      this.add.text(400, 360, `存活时间: ${this.survivalTime}秒`, {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5);
    } else {
      // 碰撞后短暂闪烁效果
      player.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        if (this.isAlive) {
          player.clearTint();
        }
      });

      // 将敌人推开一段距离
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );
      enemy.x = player.x - Math.cos(angle) * 100;
      enemy.y = player.y - Math.sin(angle) * 100;
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);