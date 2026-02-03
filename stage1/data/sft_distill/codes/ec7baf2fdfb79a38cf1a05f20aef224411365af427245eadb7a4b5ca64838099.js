class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 5;
    this.isGameOver = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建粉色Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff69b4, 1); // 粉色
    bossGraphics.fillCircle(50, 50, 50);
    bossGraphics.generateTexture('bossTexture', 100, 100);
    bossGraphics.destroy();

    // 创建Boss精灵
    this.boss = this.physics.add.sprite(width / 2, 150, 'bossTexture');
    this.boss.setCollideWorldBounds(true);
    
    // Boss左右移动
    this.boss.setVelocityX(100);

    // 创建玩家（蓝色方块）纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('playerTexture', 40, 40);
    playerGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height - 100, 'playerTexture');
    this.player.setCollideWorldBounds(true);

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bulletTexture', 10, 10);
    bulletGraphics.destroy();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bulletTexture',
      maxSize: 20
    });

    // 鼠标点击发射子弹
    this.input.on('pointerdown', (pointer) => {
      if (!this.isGameOver) {
        this.shootBullet(pointer.x);
      }
    });

    // 键盘控制玩家移动
    this.cursors = this.input.keyboard.createCursorKeys();

    // 子弹与Boss碰撞检测
    this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, null, this);

    // 显示Boss血量
    this.healthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}`, {
      fontSize: '24px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    // 胜利文本（初始隐藏）
    this.victoryText = this.add.text(width / 2, height / 2, 'VICTORY!', {
      fontSize: '64px',
      fill: '#ffff00',
      stroke: '#000',
      strokeThickness: 6
    });
    this.victoryText.setOrigin(0.5);
    this.victoryText.setVisible(false);

    // 提示文本
    this.add.text(width / 2, height - 30, 'Click to shoot | Arrow keys to move', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // Boss边界反弹
    if (this.boss.x <= 50 || this.boss.x >= this.cameras.main.width - 50) {
      this.boss.setVelocityX(-this.boss.body.velocity.x);
    }

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        this.bullets.killAndHide(bullet);
        bullet.body.enable = false;
      }
    });
  }

  shootBullet(targetX) {
    // 从玩家位置发射子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      
      // 计算子弹方向（朝向鼠标点击位置）
      const angle = Phaser.Math.Angle.Between(
        this.player.x, 
        this.player.y, 
        targetX, 
        this.player.y - 100
      );
      
      // 设置子弹速度为300
      this.physics.velocityFromRotation(angle, 300, bullet.body.velocity);
    }
  }

  hitBoss(bullet, boss) {
    // 子弹命中Boss
    this.bullets.killAndHide(bullet);
    bullet.body.enable = false;

    // Boss扣血
    this.bossHealth--;
    this.healthText.setText(`Boss HP: ${this.bossHealth}`);

    // Boss闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    // 检查Boss是否被击败
    if (this.bossHealth <= 0) {
      this.defeatBoss();
    }
  }

  defeatBoss() {
    this.isGameOver = true;

    // 停止Boss移动
    this.boss.setVelocity(0, 0);

    // Boss消失动画
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 0,
      duration: 500,
      onComplete: () => {
        this.boss.destroy();
      }
    });

    // 显示胜利文本
    this.victoryText.setVisible(true);
    this.tweens.add({
      targets: this.victoryText,
      scale: { from: 0, to: 1.2 },
      duration: 500,
      ease: 'Back.easeOut'
    });

    // 停止所有子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        bullet.setVelocity(0, 0);
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BossBattleScene
};

// 创建游戏实例
const game = new Phaser.Game(config);