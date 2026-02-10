class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.survivalTime = 0;
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 28);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成10个敌人，随机位置
    for (let i = 0; i < 10; i++) {
      let x, y;
      // 确保敌人不会生成在玩家附近
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
      } while (Phaser.Math.Distance.Between(x, y, 400, 300) < 150);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.body.setCircle(14);
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0.5);
    }

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // UI文本
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.timeText = this.add.text(16, 50, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 计时器
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.gameOver) {
          this.survivalTime++;
          this.timeText.setText(`Time: ${this.survivalTime}s`);
        }
      },
      loop: true
    });

    // 无敌时间标记
    this.invincible = false;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动
    const playerSpeed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 对角线移动时速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家
    const enemySpeed = 80;
    this.enemies.children.entries.forEach(enemy => {
      // 计算从敌人到玩家的方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );

      // 设置敌人速度
      this.physics.velocityFromRotation(angle, enemySpeed, enemy.body.velocity);
    });
  }

  hitEnemy(player, enemy) {
    if (this.invincible || this.gameOver) {
      return;
    }

    // 减少生命值
    this.health--;
    this.healthText.setText(`Health: ${this.health}`);

    // 设置无敌时间
    this.invincible = true;
    this.player.setAlpha(0.5);

    // 击退效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );
    this.physics.velocityFromRotation(angle, 300, player.body.velocity);

    // 1秒后恢复
    this.time.delayedCall(1000, () => {
      this.invincible = false;
      this.player.setAlpha(1);
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver = true;
      this.player.setTint(0xff0000);
      this.statusText.setText('GAME OVER!');
      this.statusText.setVisible(true);

      // 停止所有敌人
      this.enemies.children.entries.forEach(enemy => {
        enemy.body.setVelocity(0);
      });

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