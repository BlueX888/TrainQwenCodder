class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 3; // 可验证状态
    this.gameOver = false;
    this.lastFired = 0;
    this.fireRate = 500; // 发射间隔
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成纹理
    this.createTextures();

    // 创建玩家（底部中央，绿色）
    this.player = this.physics.add.sprite(400, 550, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建 Boss（顶部中央，青色）
    this.boss = this.physics.add.sprite(400, 100, 'bossTex');
    this.boss.setCollideWorldBounds(true);
    this.boss.setVelocityX(100); // Boss 左右移动
    this.boss.setBounce(1, 0); // 碰到边界反弹

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

    // 创建 UI 文本
    this.healthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.victoryText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#0ff',
      fontFamily: 'Arial'
    });
    this.victoryText.setOrigin(0.5);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 提示文本
    this.add.text(400, 580, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '16px',
      fill: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  createTextures() {
    // 玩家纹理（绿色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 30);
    playerGraphics.generateTexture('playerTex', 40, 30);
    playerGraphics.destroy();

    // Boss 纹理（青色大矩形）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0x00ffff, 1);
    bossGraphics.fillRect(0, 0, 80, 60);
    bossGraphics.generateTexture('bossTex', 80, 60);
    bossGraphics.destroy();

    // 子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bulletTex', 10, 10);
    bulletGraphics.destroy();
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 清理屏幕外的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  fireBullet() {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-300); // 子弹速度 300
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

    // Boss 闪烁效果
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
    
    // 停止 Boss 移动
    this.boss.setVelocity(0, 0);
    
    // 销毁 Boss（爆炸效果）
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
    this.victoryText.setText('VICTORY!');
    this.tweens.add({
      targets: this.victoryText,
      scale: { from: 0, to: 1.5 },
      alpha: { from: 0, to: 1 },
      duration: 1000,
      ease: 'Bounce.easeOut'
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    
    // 禁用输入
    this.input.keyboard.enabled = false;
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