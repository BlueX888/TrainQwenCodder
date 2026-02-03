class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8; // 可验证的状态变量
    this.maxBossHealth = 8;
    this.isGameOver = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 30);
    playerGraphics.generateTexture('player', 40, 30);
    playerGraphics.destroy();

    // 创建Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xffffff, 1);
    bossGraphics.fillRect(0, 0, 120, 100);
    bossGraphics.generateTexture('boss', 120, 100);
    bossGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 150, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setImmovable(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;

    // 碰撞检测：子弹命中Boss
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
      fill: '#ffffff'
    });

    // Boss血条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x666666, 1);
    this.healthBarBg.fillRect(340, 80, 120, 15);

    // Boss血条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 胜利文本（初始隐藏）
    this.victoryText = this.add.text(400, 300, 'VICTORY!', {
      fontSize: '64px',
      fill: '#00ff00',
      fontStyle: 'bold'
    });
    this.victoryText.setOrigin(0.5);
    this.victoryText.setVisible(false);
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

    // 发射子弹
    if (this.spaceKey.isDown && this.canShoot) {
      this.shootBullet();
      this.canShoot = false;
      this.time.delayedCall(250, () => {
        this.canShoot = true;
      });
    }

    // 清理屏幕外的子弹
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
      bullet.body.setVelocityY(-240); // 子弹速度240
    }
  }

  hitBoss(bullet, boss) {
    // 子弹命中Boss
    bullet.setActive(false);
    bullet.setVisible(false);
    
    // Boss扣血
    this.bossHealth--;
    this.healthText.setText(`Boss Health: ${this.bossHealth}/${this.maxBossHealth}`);
    this.updateHealthBar();

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

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercent = this.bossHealth / this.maxBossHealth;
    const barWidth = 120 * healthPercent;
    
    if (healthPercent > 0.5) {
      this.healthBar.fillStyle(0x00ff00, 1);
    } else if (healthPercent > 0.25) {
      this.healthBar.fillStyle(0xffaa00, 1);
    } else {
      this.healthBar.fillStyle(0xff0000, 1);
    }
    
    this.healthBar.fillRect(340, 80, barWidth, 15);
  }

  defeatBoss() {
    this.isGameOver = true;
    
    // Boss爆炸效果
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 2,
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

    // 停止玩家控制
    this.player.setVelocity(0);
    
    console.log('Victory! Boss defeated!');
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BossBattleScene
};

const game = new Phaser.Game(config);

// 暴露状态供外部验证
window.getBossHealth = () => {
  const scene = game.scene.scenes[0];
  return scene ? scene.bossHealth : null;
};