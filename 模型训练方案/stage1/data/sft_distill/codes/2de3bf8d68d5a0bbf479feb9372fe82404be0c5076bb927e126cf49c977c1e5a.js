class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 可验证的状态信号
    this.isHurt = false; // 受伤状态标记
    this.blinkTimer = null;
    this.blinkCount = 0;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(500, 300, 'enemy');
    this.enemy.setVelocity(50, 0); // 敌人移动
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setBounce(1, 1); // 碰到边界反弹

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.healthText = this.add.text(10, 10, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(10, 40, 'Status: Normal', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    console.log('Game initialized. Health:', this.health);
  }

  handleCollision(player, enemy) {
    // 如果已经在受伤状态，不重复触发
    if (this.isHurt) {
      return;
    }

    console.log('Collision detected! Starting hurt effect...');
    
    // 设置受伤状态
    this.isHurt = true;
    this.health -= 10;
    this.healthText.setText(`Health: ${this.health}`);
    this.statusText.setText('Status: HURT!');
    this.statusText.setColor('#ff0000');

    console.log('Health reduced to:', this.health);

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 根据速度120计算击退距离
    // 击退距离 = 速度 * 时间，这里设定击退时间为0.3秒
    const knockbackSpeed = 120;
    const knockbackTime = 0.3; // 秒
    const knockbackDistance = knockbackSpeed * knockbackTime; // 36像素

    const knockbackX = Math.cos(angle) * knockbackDistance;
    const knockbackY = Math.sin(angle) * knockbackDistance;

    // 执行击退效果
    this.tweens.add({
      targets: player,
      x: player.x + knockbackX,
      y: player.y + knockbackY,
      duration: knockbackTime * 1000, // 转换为毫秒
      ease: 'Power2',
      onComplete: () => {
        console.log('Knockback complete');
      }
    });

    // 开始闪烁效果（3秒）
    this.startBlinkEffect(player);
  }

  startBlinkEffect(sprite) {
    const blinkDuration = 3000; // 3秒
    const blinkInterval = 100; // 每100ms切换一次
    const totalBlinks = blinkDuration / blinkInterval;

    this.blinkCount = 0;
    let isVisible = true;

    console.log('Starting blink effect for 3 seconds...');

    // 创建闪烁定时器
    this.blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        this.blinkCount++;
        
        // 切换透明度
        isVisible = !isVisible;
        sprite.setAlpha(isVisible ? 1 : 0.3);

        // 同时添加红色色调
        if (!isVisible) {
          sprite.setTint(0xff0000);
        } else {
          sprite.clearTint();
        }

        // 3秒后结束闪烁
        if (this.blinkCount >= totalBlinks) {
          this.endBlinkEffect(sprite);
        }
      },
      loop: true
    });
  }

  endBlinkEffect(sprite) {
    console.log('Blink effect ended. Total blinks:', this.blinkCount);
    
    // 停止定时器
    if (this.blinkTimer) {
      this.blinkTimer.remove();
      this.blinkTimer = null;
    }

    // 恢复正常状态
    sprite.setAlpha(1);
    sprite.clearTint();
    this.isHurt = false;
    this.blinkCount = 0;

    this.statusText.setText('Status: Normal');
    this.statusText.setColor('#00ff00');

    console.log('Player recovered. Current health:', this.health);
  }

  update(time, delta) {
    // 玩家移动控制
    if (!this.isHurt) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
      } else {
        this.player.setVelocityX(0);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-160);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(160);
      } else {
        this.player.setVelocityY(0);
      }
    } else {
      // 受伤时停止玩家输入控制
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
    }

    // 检查生命值
    if (this.health <= 0) {
      this.statusText.setText('Status: GAME OVER');
      this.statusText.setColor('#ff0000');
      this.scene.pause();
      console.log('Game Over!');
    }
  }
}

// 游戏配置
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

// 启动游戏
const game = new Phaser.Game(config);