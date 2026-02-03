class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isInvincible = false;
    this.health = 3;
    this.hitCount = 0;
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
  }

  create() {
    // 创建青色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ffff, 1); // 青色
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1); // 红色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵（青色角色）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(200, 300, 'enemy');
    this.enemy.setVelocity(100, 50);
    this.enemy.setBounce(1);
    this.enemy.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleHit,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 提示文本
    this.add.text(16, 550, '使用方向键移动青色角色，碰撞红色敌人触发受伤效果', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  handleHit(player, enemy) {
    // 如果正在无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 减少生命值
    this.health--;
    this.hitCount++;
    this.updateStatusText();

    // 设置无敌状态
    this.isInvincible = true;

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退距离基于速度160计算（速度160 -> 击退距离约160像素）
    const knockbackDistance = 160;
    const knockbackX = Math.cos(angle) * knockbackDistance;
    const knockbackY = Math.sin(angle) * knockbackDistance;

    // 停止玩家当前速度
    player.setVelocity(0, 0);

    // 播放击退动画（使用Tween）
    this.tweens.add({
      targets: player,
      x: player.x + knockbackX,
      y: player.y + knockbackY,
      duration: 300, // 击退持续时间
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // 击退完成后恢复正常
      }
    });

    // 开始闪烁效果（4秒）
    this.startBlinkEffect(player, 4000);

    // 4秒后解除无敌状态
    this.time.delayedCall(4000, () => {
      this.isInvincible = false;
      player.alpha = 1; // 确保完全可见
      this.updateStatusText();
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  startBlinkEffect(sprite, duration) {
    // 闪烁间隔（毫秒）
    const blinkInterval = 150;
    let elapsed = 0;
    let isVisible = true;

    // 创建闪烁定时器
    const blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        elapsed += blinkInterval;
        
        // 切换透明度（0.3和1之间）
        isVisible = !isVisible;
        sprite.alpha = isVisible ? 1 : 0.3;

        // 达到持续时间后停止
        if (elapsed >= duration) {
          blinkTimer.remove();
          sprite.alpha = 1; // 恢复完全可见
        }
      },
      loop: true
    });
  }

  updateStatusText() {
    const invincibleStatus = this.isInvincible ? '无敌中' : '正常';
    this.statusText.setText(
      `生命值: ${this.health} | 受击次数: ${this.hitCount} | 状态: ${invincibleStatus}`
    );
  }

  gameOver() {
    this.physics.pause();
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 370, '点击重新开始', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    restartText.setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 只有在非无敌状态下才能移动（可选：也可以允许无敌时移动）
    if (!this.isInvincible) {
      // 键盘控制玩家移动
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
    } else {
      // 无敌期间不受键盘控制（击退动画期间）
      // 注意：Tween会覆盖velocity，所以这里不需要额外处理
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