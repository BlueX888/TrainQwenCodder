class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 5;
    this.maxBossHealth = 5;
    this.isGameOver = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（绿色矩形飞船）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 30);
    playerGraphics.generateTexture('player', 40, 30);
    playerGraphics.destroy();

    // 创建Boss纹理（粉色圆形）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff69b4, 1);
    bossGraphics.fillCircle(50, 50, 50);
    bossGraphics.generateTexture('boss', 100, 100);
    bossGraphics.destroy();

    // 创建子弹纹理（黄色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height - 80, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(width / 2, 120, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocityX(150);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;

    // 碰撞检测：子弹击中Boss
    this.physics.add.overlap(
      this.bullets,
      this.boss,
      this.hitBoss,
      null,
      this
    );

    // UI文本
    this.healthText = this.add.text(16, 16, `Boss Health: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.victoryText = this.add.text(width / 2, height / 2, 'VICTORY!', {
      fontSize: '64px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.victoryText.setOrigin(0.5);
    this.victoryText.setVisible(false);

    // 状态信号（用于验证）
    this.gameState = {
      bossHealth: this.bossHealth,
      bulletsShot: 0,
      victory: false
    };
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 玩家射击
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
      this.shootBullet();
    }

    // Boss左右移动
    if (this.boss.x <= 60) {
      this.boss.body.setVelocityX(150);
    } else if (this.boss.x >= this.cameras.main.width - 60) {
      this.boss.body.setVelocityX(-150);
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocityY(-300);
      
      this.gameState.bulletsShot++;
      this.canShoot = false;

      // 射击冷却时间
      this.time.delayedCall(200, () => {
        this.canShoot = true;
      });
    }
  }

  hitBoss(bullet, boss) {
    // 子弹击中Boss
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);

    // Boss扣血
    this.bossHealth--;
    this.gameState.bossHealth = this.bossHealth;
    this.healthText.setText(`Boss Health: ${this.bossHealth}/${this.maxBossHealth}`);

    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    // 检查胜利条件
    if (this.bossHealth <= 0) {
      this.victory();
    }
  }

  victory() {
    this.isGameOver = true;
    this.gameState.victory = true;

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
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    console.log('Victory! Game State:', this.gameState);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000033',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BossBattleScene
};

new Phaser.Game(config);