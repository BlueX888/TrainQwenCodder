// 完整的 Phaser3 代码
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0; // 可验证的状态信号：存活时间
    this.isGameOver = false; // 可验证的状态信号：游戏是否结束
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
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
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setCircle(16);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 在场景边缘随机生成5个敌人
    const positions = [
      { x: 50, y: 50 },
      { x: 750, y: 50 },
      { x: 50, y: 550 },
      { x: 750, y: 550 },
      { x: 400, y: 50 }
    ];

    positions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.body.setCircle(12);
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建UI文本
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.instructionText = this.add.text(400, 100, 'Use Arrow Keys or WASD to move\nAvoid the red enemies!', {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center'
    });
    this.instructionText.setOrigin(0.5);

    // 3秒后移除提示文本
    this.time.delayedCall(3000, () => {
      if (this.instructionText) {
        this.instructionText.destroy();
      }
    });

    this.gameOverText = null;
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime += delta;
    this.timeText.setText('Time: ' + Math.floor(this.survivalTime / 1000) + 's');

    // 玩家移动控制
    const speed = 250;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 归一化对角线移动速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // 敌人追踪玩家逻辑
    const enemySpeed = 200;
    this.enemies.getChildren().forEach(enemy => {
      // 计算从敌人到玩家的角度
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      // 根据角度设置敌人速度
      this.physics.velocityFromRotation(angle, enemySpeed, enemy.body.velocity);

      // 旋转敌人朝向玩家
      enemy.rotation = angle;
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    // 游戏结束
    this.isGameOver = true;

    // 停止所有物理对象
    this.physics.pause();

    // 玩家变红表示被击中
    player.setTint(0xff0000);

    // 显示游戏结束文本
    this.gameOverText = this.add.text(400, 300, 
      'GAME OVER!\nSurvival Time: ' + Math.floor(this.survivalTime / 1000) + 's\n\nClick to Restart', 
      {
        fontSize: '32px',
        fill: '#ff0000',
        align: 'center',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }
    );
    this.gameOverText.setOrigin(0.5);

    // 点击重启游戏
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
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