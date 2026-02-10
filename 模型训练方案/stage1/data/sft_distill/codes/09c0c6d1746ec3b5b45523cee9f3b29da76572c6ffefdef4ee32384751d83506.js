class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 12;
    this.maxBossHealth = 12;
    this.gameOver = false;
    this.victory = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建Boss纹理（粉色圆形）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff69b4, 1);
    bossGraphics.fillCircle(40, 40, 40);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.setBounce(1, 1);
    this.boss.setVelocity(100, 80);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测：子弹命中Boss
    this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, null, this);

    // UI文本
    this.healthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.victoryText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });
    this.victoryText.setOrigin(0.5);

    // 提示文本
    this.add.text(400, 550, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '18px',
      fill: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动
    const speed = 250;
    this.player.setVelocity(0, 0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 发射子弹（每200ms最多发射一次）
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.shootBullet();
      this.lastFired = time;
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
      bullet.body.enable = true;
      bullet.setVelocityY(-300); // 子弹速度300
    }
  }

  hitBoss(bullet, boss) {
    // 子弹击中Boss
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;

    // Boss扣血
    this.bossHealth--;
    this.healthText.setText(`Boss HP: ${this.bossHealth}/${this.maxBossHealth}`);

    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    // 检查是否胜利
    if (this.bossHealth <= 0) {
      this.winGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.victory = true;

    // Boss消失
    this.boss.setVisible(false);
    this.boss.body.enable = false;

    // 显示胜利文本
    this.victoryText.setText('VICTORY!');
    this.victoryText.setStyle({ fill: '#00ff00' });

    // 停止所有子弹
    this.bullets.children.entries.forEach(bullet => {
      bullet.setActive(false);
      bullet.setVisible(false);
    });

    // 添加胜利动画
    this.tweens.add({
      targets: this.victoryText,
      scale: { from: 0, to: 1.5 },
      duration: 1000,
      ease: 'Bounce.easeOut'
    });

    console.log('Game State: Victory! Boss defeated!');
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