class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.hitCount = 0; // 受伤次数统计
    this.isInvincible = false; // 无敌状态
    this.health = 100; // 生命值
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建紫色角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x9b59d6, 1); // 紫色
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xe74c3c, 1); // 红色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(30, 30);

    // 创建敌人
    this.enemy = this.physics.add.sprite(200, 300, 'enemy');
    this.enemy.setVelocity(100, 50);
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

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加提示文本
    this.add.text(400, 50, '使用方向键移动紫色角色，碰到红色敌人会受伤', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  update() {
    // 玩家移动控制
    if (!this.isInvincible || this.player.body.velocity.length() < 50) {
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
    // 如果已经在无敌状态，不再触发受伤
    if (this.isInvincible) {
      return;
    }

    // 进入无敌状态
    this.isInvincible = true;
    this.hitCount++;
    this.health = Math.max(0, this.health - 10);
    this.updateStatusText();

    // 计算击退方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退距离基于速度200
    const knockbackDistance = 150;
    const knockbackX = Math.cos(angle) * knockbackDistance;
    const knockbackY = Math.sin(angle) * knockbackDistance;

    // 目标位置（确保不超出边界）
    const targetX = Phaser.Math.Clamp(
      player.x + knockbackX,
      20,
      this.sys.game.config.width - 20
    );
    const targetY = Phaser.Math.Clamp(
      player.y + knockbackY,
      20,
      this.sys.game.config.height - 20
    );

    // 击退效果（使用Tween）
    this.tweens.add({
      targets: player,
      x: targetX,
      y: targetY,
      duration: 300,
      ease: 'Cubic.easeOut'
    });

    // 闪烁效果（2.5秒）
    let blinkCount = 0;
    const blinkDuration = 2500; // 2.5秒
    const blinkInterval = 100; // 每100ms切换一次
    const totalBlinks = blinkDuration / blinkInterval;

    const blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        blinkCount++;
        // 切换透明度（0.2和1之间）
        player.alpha = player.alpha === 1 ? 0.2 : 1;

        // 闪烁结束
        if (blinkCount >= totalBlinks) {
          player.alpha = 1;
          this.isInvincible = false;
          blinkTimer.destroy();
        }
      },
      loop: true
    });

    // 添加击中反馈（屏幕轻微震动效果）
    this.cameras.main.shake(200, 0.005);

    // 播放击中音效的视觉反馈（创建临时冲击波）
    this.createImpactEffect(player.x, player.y);
  }

  createImpactEffect(x, y) {
    const impactGraphics = this.add.graphics();
    impactGraphics.lineStyle(3, 0xffffff, 1);
    impactGraphics.strokeCircle(0, 0, 10);
    impactGraphics.generateTexture('impact', 20, 20);
    impactGraphics.destroy();

    const impact = this.add.sprite(x, y, 'impact');
    impact.setAlpha(0.8);

    // 冲击波扩散效果
    this.tweens.add({
      targets: impact,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        impact.destroy();
      }
    });
  }

  updateStatusText() {
    this.statusText.setText(
      `受伤次数: ${this.hitCount}\n` +
      `生命值: ${this.health}\n` +
      `无敌状态: ${this.isInvincible ? '是' : '否'}`
    );
  }
}

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

new Phaser.Game(config);