class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 可验证状态信号
    this.isInvulnerable = false;
    this.blinkTimer = null;
    this.blinkCount = 0;
  }

  preload() {
    // 创建黄色角色纹理
    const yellowGraphics = this.add.graphics();
    yellowGraphics.fillStyle(0xffff00, 1);
    yellowGraphics.fillRect(0, 0, 40, 40);
    yellowGraphics.generateTexture('player', 40, 40);
    yellowGraphics.destroy();

    // 创建红色敌人纹理
    const redGraphics = this.add.graphics();
    redGraphics.fillStyle(0xff0000, 1);
    redGraphics.fillRect(0, 0, 40, 40);
    redGraphics.generateTexture('enemy', 40, 40);
    redGraphics.destroy();
  }

  create() {
    // 创建黄色角色（玩家）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人用于测试
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人在不同位置
    const enemy1 = this.enemies.create(200, 200, 'enemy');
    const enemy2 = this.enemies.create(600, 200, 'enemy');
    const enemy3 = this.enemies.create(400, 450, 'enemy');

    // 让敌人移动
    this.enemies.children.entries.forEach((enemy, index) => {
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleHit,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(16, 50, 'Status: Normal', {
      fontSize: '20px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(16, 550, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  handleHit(player, enemy) {
    // 如果正在无敌状态，不触发受伤
    if (this.isInvulnerable) {
      return;
    }

    // 减少生命值
    this.health -= 10;
    this.healthText.setText(`Health: ${this.health}`);

    // 进入无敌状态
    this.isInvulnerable = true;
    this.statusText.setText('Status: Hit!');
    this.statusText.setColor('#ff0000');

    // 计算击退方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退距离基于速度80
    const knockbackDistance = 80;
    const knockbackX = Math.cos(angle) * knockbackDistance;
    const knockbackY = Math.sin(angle) * knockbackDistance;

    // 停止玩家当前移动
    player.setVelocity(0, 0);

    // 使用Tween实现击退效果
    this.tweens.add({
      targets: player,
      x: player.x + knockbackX,
      y: player.y + knockbackY,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        // 击退完成后恢复控制
      }
    });

    // 开始闪烁效果（2秒，每100ms切换一次）
    this.blinkCount = 0;
    const blinkDuration = 2000; // 2秒
    const blinkInterval = 100; // 100ms切换一次
    const totalBlinks = blinkDuration / blinkInterval;

    this.blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        this.blinkCount++;
        
        // 切换可见性
        player.alpha = player.alpha === 1 ? 0.3 : 1;

        // 2秒后结束闪烁
        if (this.blinkCount >= totalBlinks) {
          player.alpha = 1;
          this.isInvulnerable = false;
          this.statusText.setText('Status: Normal');
          this.statusText.setColor('#00ff00');
          
          if (this.blinkTimer) {
            this.blinkTimer.remove();
            this.blinkTimer = null;
          }
        }
      },
      loop: true
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.health = 0;
      this.healthText.setText(`Health: ${this.health}`);
      this.statusText.setText('Status: Game Over!');
      this.statusText.setColor('#ff0000');
      this.physics.pause();
      
      // 显示重启提示
      this.add.text(400, 300, 'Game Over!\nClick to Restart', {
        fontSize: '32px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
        align: 'center'
      }).setOrigin(0.5);

      this.input.once('pointerdown', () => {
        this.scene.restart();
      });
    }
  }

  update() {
    // 只有在非无敌状态且游戏未结束时才能移动
    if (!this.isInvulnerable && this.health > 0) {
      const speed = 200;

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
      } else {
        this.player.setVelocityX(0);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed);
      } else {
        this.player.setVelocityY(0);
      }
    } else if (this.isInvulnerable && this.health > 0) {
      // 无敌期间也停止移动
      this.player.setVelocity(0, 0);
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