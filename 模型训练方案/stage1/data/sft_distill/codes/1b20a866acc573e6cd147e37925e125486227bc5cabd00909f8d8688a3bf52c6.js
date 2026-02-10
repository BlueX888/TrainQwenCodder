class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3; // 可验证状态：生命值
    this.isInvincible = false; // 无敌状态
    this.hitCount = 0; // 受击次数统计
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建蓝色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家（蓝色方块）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建多个敌人用于测试
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人在不同位置
    const enemy1 = this.enemies.create(200, 200, 'enemy');
    const enemy2 = this.enemies.create(600, 400, 'enemy');
    const enemy3 = this.enemies.create(300, 450, 'enemy');
    
    // 设置敌人移动
    this.enemies.children.entries.forEach((enemy, index) => {
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
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

    this.hitCountText = this.add.text(16, 50, `Hit Count: ${this.hitCount}`, {
      fontSize: '20px',
      fill: '#ffff00'
    });

    this.statusText = this.add.text(16, 80, 'Status: Normal', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    // 操作提示
    this.add.text(16, 550, 'Arrow Keys: Move | Collide with red enemies to test hit effect', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  handleHit(player, enemy) {
    // 如果正在无敌状态，不触发受伤
    if (this.isInvincible) {
      return;
    }

    // 减少生命值
    this.health--;
    this.hitCount++;
    this.healthText.setText(`Health: ${this.health}`);
    this.hitCountText.setText(`Hit Count: ${this.hitCount}`);

    // 设置无敌状态
    this.isInvincible = true;
    this.statusText.setText('Status: INVINCIBLE (Hit!)');
    this.statusText.setColor('#ff0000');

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退速度240，计算击退距离（假设击退时间0.3秒）
    const knockbackSpeed = 240;
    const knockbackTime = 300; // 毫秒
    const knockbackDistance = (knockbackSpeed * knockbackTime) / 1000;

    // 计算击退终点
    const knockbackX = player.x + Math.cos(angle) * knockbackDistance;
    const knockbackY = player.y + Math.sin(angle) * knockbackDistance;

    // 停止玩家当前移动
    player.setVelocity(0, 0);

    // 播放击退动画
    this.tweens.add({
      targets: player,
      x: knockbackX,
      y: knockbackY,
      duration: knockbackTime,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // 击退完成后恢复控制
        player.body.enable = true;
      }
    });

    // 闪烁效果：0.5秒内闪烁
    const blinkDuration = 500; // 0.5秒
    const blinkInterval = 50; // 每50ms切换一次
    let blinkCount = 0;
    const maxBlinks = blinkDuration / blinkInterval;

    const blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        // 切换透明度实现闪烁
        player.alpha = player.alpha === 1 ? 0.3 : 1;
        blinkCount++;

        // 闪烁结束
        if (blinkCount >= maxBlinks) {
          player.alpha = 1; // 恢复完全可见
          this.isInvincible = false; // 解除无敌状态
          this.statusText.setText('Status: Normal');
          this.statusText.setColor('#00ff00');
          blinkTimer.destroy();
        }
      },
      loop: true
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.statusText.setText('Status: GAME OVER');
      this.statusText.setColor('#ff0000');
      this.physics.pause();
      
      this.add.text(400, 300, 'GAME OVER', {
        fontSize: '64px',
        fill: '#ff0000'
      }).setOrigin(0.5);
    }
  }

  update(time, delta) {
    // 只有在非无敌状态且游戏未结束时才能移动
    if (!this.isInvincible && this.health > 0) {
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
    } else if (this.isInvincible) {
      // 无敌时停止移动（击退期间）
      if (!this.tweens.isTweening(this.player)) {
        this.player.setVelocity(0, 0);
      }
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