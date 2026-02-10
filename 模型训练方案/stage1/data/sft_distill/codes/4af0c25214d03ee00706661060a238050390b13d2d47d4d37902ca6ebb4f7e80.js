class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 15;
    this.maxBossHealth = 15;
    this.gameWon = false;
    this.bullets = null;
    this.boss = null;
    this.player = null;
    this.cursors = null;
    this.spaceKey = null;
    this.lastFired = 0;
    this.fireRate = 300; // 发射间隔（毫秒）
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'bossTex');
    this.boss.setCollideWorldBounds(true);
    this.boss.setBounce(1, 0);
    this.boss.setVelocityX(150);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bulletTex',
      maxSize: 20
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.boss,
      this.hitBoss,
      null,
      this
    );

    // 输入控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // UI文本
    this.healthText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#fff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#0f0',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    this.updateHealthDisplay();
  }

  createTextures() {
    // 玩家纹理（蓝色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 30);
    playerGraphics.generateTexture('playerTex', 40, 30);
    playerGraphics.destroy();

    // Boss纹理（红色大矩形）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 120, 80);
    bossGraphics.generateTexture('bossTex', 120, 80);
    bossGraphics.destroy();

    // 子弹纹理（黄色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bulletTex', 10, 10);
    bulletGraphics.destroy();
  }

  update(time, delta) {
    if (this.gameWon) {
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
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-360); // 子弹速度360向上
    }
  }

  hitBoss(bullet, boss) {
    // 销毁子弹
    bullet.setActive(false);
    bullet.setVisible(false);

    // Boss扣血
    this.bossHealth -= 1;
    this.updateHealthDisplay();

    // Boss闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    // 检查是否胜利
    if (this.bossHealth <= 0) {
      this.victory();
    }
  }

  updateHealthDisplay() {
    this.healthText.setText(
      `Boss Health: ${this.bossHealth}/${this.maxBossHealth}`
    );
  }

  victory() {
    this.gameWon = true;
    
    // 停止Boss移动
    this.boss.setVelocity(0, 0);
    
    // 清除所有子弹
    this.bullets.clear(true, true);
    
    // 显示胜利文本
    this.statusText.setText('Victory!');
    this.statusText.setVisible(true);
    
    // 胜利动画
    this.tweens.add({
      targets: this.statusText,
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Boss爆炸效果（淡出）
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      onComplete: () => {
        this.boss.destroy();
      }
    });

    console.log('Game Won! Boss defeated!');
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

new Phaser.Game(config);