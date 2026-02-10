class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 5;
    this.gameOver = false;
    this.lastFireTime = 0;
    this.fireDelay = 500; // 发射间隔 500ms
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建 Boss
    this.boss = this.physics.add.sprite(400, 100, 'bossTex');
    this.boss.setCollideWorldBounds(true);
    this.boss.setVelocityX(150); // Boss 左右移动
    this.boss.setBounce(1, 0); // 碰到边界反弹

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bulletTex',
      maxSize: 20
    });

    // 碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.boss,
      this.hitBoss,
      null,
      this
    );

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // UI 文本
    this.healthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.victoryText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#0f0',
      fontFamily: 'Arial'
    });
    this.victoryText.setOrigin(0.5);

    // 状态信号（用于验证）
    this.registry.set('bossHealth', this.bossHealth);
    this.registry.set('gameWon', false);
  }

  update(time, delta) {
    if (this.gameOver) {
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
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireDelay) {
      this.fireBullet();
      this.lastFireTime = time;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  createTextures() {
    // 玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('playerTex', 40, 40);
    playerGraphics.destroy();

    // Boss 纹理（绿色矩形）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0x00ff00, 1);
    bossGraphics.fillRect(0, 0, 80, 60);
    bossGraphics.generateTexture('bossTex', 80, 60);
    bossGraphics.destroy();

    // 子弹纹理（黄色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bulletTex', 10, 10);
    bulletGraphics.destroy();
  }

  fireBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 30);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-240); // 子弹速度 240
    }
  }

  hitBoss(bullet, boss) {
    // 销毁子弹
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);

    // Boss 扣血
    this.bossHealth--;
    this.healthText.setText(`Boss HP: ${this.bossHealth}`);
    
    // 更新状态信号
    this.registry.set('bossHealth', this.bossHealth);

    // Boss 受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    // 检查胜利条件
    if (this.bossHealth <= 0) {
      this.victory();
    }
  }

  victory() {
    this.gameOver = true;
    this.registry.set('gameWon', true);

    // 销毁 Boss
    this.boss.setActive(false);
    this.boss.setVisible(false);

    // 显示胜利文本
    this.victoryText.setText('VICTORY!');
    
    // 停止所有子弹
    this.bullets.children.entries.forEach(bullet => {
      bullet.setVelocity(0, 0);
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    console.log('Game Won! Boss Defeated!');
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