class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.isInvincible = false;
    this.hitCount = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(200, 300, 'enemy');
    this.enemy.setVelocity(80, 0); // 设置敌人移动速度为80
    this.enemy.setBounce(1, 1);
    this.enemy.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleHit,
      null,
      this
    );

    // 添加键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加说明文本
    this.add.text(10, 550, '使用方向键移动绿色角色，碰撞红色敌人会受伤', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update() {
    // 玩家移动控制
    if (!this.isInvincible || this.player.body.velocity.x === 0) {
      this.player.setVelocity(0);

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-200);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(200);
      }
    }
  }

  handleHit(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 设置无敌状态
    this.isInvincible = true;
    this.hitCount++;

    // 扣除生命值
    this.health = Math.max(0, this.health - 10);
    this.updateStatusText();

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 根据敌人速度80计算击退距离（速度80 -> 击退距离120）
    const knockbackDistance = 120;
    const knockbackX = player.x + Math.cos(angle) * knockbackDistance;
    const knockbackY = player.y + Math.sin(angle) * knockbackDistance;

    // 限制击退目标位置在世界边界内
    const targetX = Phaser.Math.Clamp(knockbackX, 20, 780);
    const targetY = Phaser.Math.Clamp(knockbackY, 20, 580);

    // 播放击退动画（使用 Tween）
    this.tweens.add({
      targets: player,
      x: targetX,
      y: targetY,
      duration: 200,
      ease: 'Power2'
    });

    // 实现闪烁效果（1秒内闪烁）
    let blinkCount = 0;
    const blinkInterval = 100; // 每100ms切换一次
    const totalBlinks = 10; // 1秒内闪烁10次

    const blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        player.alpha = player.alpha === 1 ? 0.3 : 1;
        blinkCount++;

        if (blinkCount >= totalBlinks) {
          blinkTimer.remove();
          player.alpha = 1;
          this.isInvincible = false;
        }
      },
      loop: true
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `生命值: ${this.health} | 受击次数: ${this.hitCount} | 无敌: ${this.isInvincible ? '是' : '否'}`
    );
  }

  gameOver() {
    this.physics.pause();
    this.player.setTint(0x808080);
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER\n点击重新开始', {
      fontSize: '32px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      align: 'center'
    });
    gameOverText.setOrigin(0.5);

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