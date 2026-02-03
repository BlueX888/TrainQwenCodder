class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.hitCount = 0;
    this.isInvulnerable = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
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

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建多个敌人
    const enemyPositions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 200, y: 450 },
      { x: 600, y: 450 }
    ];
    
    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
    });

    // 设置碰撞检测
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
      fill: '#ffffff'
    });

    this.hitCountText = this.add.text(16, 48, `Hit Count: ${this.hitCount}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 80, 'Status: Normal', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    // 说明文字
    this.add.text(400, 550, 'Use Arrow Keys to Move - Avoid Red Enemies', {
      fontSize: '18px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);
  }

  handleHit(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvulnerable) {
      return;
    }

    // 设置无敌状态
    this.isInvulnerable = true;
    this.hitCount++;
    this.health--;

    // 更新UI
    this.healthText.setText(`Health: ${this.health}`);
    this.hitCountText.setText(`Hit Count: ${this.hitCount}`);
    this.statusText.setText('Status: Hit!');
    this.statusText.setColor('#ff0000');

    // 计算击退方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退距离基于速度120
    const knockbackDistance = 120;
    const knockbackX = Math.cos(angle) * knockbackDistance;
    const knockbackY = Math.sin(angle) * knockbackDistance;

    // 停止玩家当前移动
    player.setVelocity(0, 0);

    // 击退动画（0.3秒内移动到目标位置）
    this.tweens.add({
      targets: player,
      x: player.x + knockbackX,
      y: player.y + knockbackY,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // 击退完成后恢复控制
      }
    });

    // 闪烁效果（1.5秒，每100ms切换一次）
    let blinkCount = 0;
    const blinkDuration = 1500;
    const blinkInterval = 100;
    const maxBlinks = blinkDuration / blinkInterval;

    const blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        blinkCount++;
        
        // 切换颜色：白色(0xffffff)和原色(0x0000ff)
        if (blinkCount % 2 === 0) {
          player.setTint(0xffffff); // 白色
        } else {
          player.clearTint(); // 恢复原色
        }

        // 闪烁结束
        if (blinkCount >= maxBlinks) {
          player.clearTint();
          this.isInvulnerable = false;
          this.statusText.setText('Status: Normal');
          this.statusText.setColor('#00ff00');
          blinkTimer.remove();
        }
      },
      loop: true
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.statusText.setText('Status: Game Over!');
      this.statusText.setColor('#ff0000');
      this.physics.pause();
      
      this.add.text(400, 300, 'GAME OVER', {
        fontSize: '48px',
        fill: '#ff0000',
        align: 'center'
      }).setOrigin(0.5);
    }
  }

  update(time, delta) {
    // 如果游戏结束，不处理输入
    if (this.health <= 0) {
      return;
    }

    // 玩家移动控制
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