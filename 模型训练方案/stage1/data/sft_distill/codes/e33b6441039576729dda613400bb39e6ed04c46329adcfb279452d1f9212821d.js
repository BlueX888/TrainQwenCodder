class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 3;
    this.gameOver = false;
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 20, 15, 20);
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建Boss纹理（青色）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0x00ffff, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillCircle(20, 20, 8);
    bossGraphics.fillCircle(60, 20, 8);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
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
    this.lastFired = 0;

    // 碰撞检测：子弹命中Boss
    this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, null, this);

    // UI文本
    this.healthText = this.add.text(16, 16, `Boss Health: ${this.bossHealth}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.victoryText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.victoryText.setOrigin(0.5);

    // 状态信号变量（用于验证）
    this.score = 0;
    this.health = this.bossHealth;
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

    // 发射子弹（间隔250ms）
    if (this.spaceKey.isDown && time > this.lastFired + 250) {
      this.fireBullet();
      this.lastFired = time;
    }

    // Boss左右移动
    if (this.boss.x <= 40) {
      this.boss.body.setVelocityX(150);
    } else if (this.boss.x >= 760) {
      this.boss.body.setVelocityX(-150);
    }

    // 清理出界子弹
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
      bullet.body.setVelocityY(-300); // 子弹速度300
    }
  }

  hitBoss(bullet, boss) {
    // 子弹命中Boss
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);

    // Boss扣血
    this.bossHealth -= 1;
    this.health = this.bossHealth; // 更新状态信号
    this.score += 100; // 增加分数
    this.healthText.setText(`Boss Health: ${this.bossHealth}`);

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
    this.gameOver = true;

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
    this.victoryText.setText('VICTORY!');
    
    // 胜利文本动画
    this.tweens.add({
      targets: this.victoryText,
      scale: { from: 0, to: 1.5 },
      alpha: { from: 0, to: 1 },
      duration: 800,
      ease: 'Bounce.easeOut'
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 清理所有子弹
    this.bullets.clear(true, true);

    // 输出状态信号（用于验证）
    console.log('Game Over - Victory!');
    console.log('Final Score:', this.score);
    console.log('Boss Health:', this.health);
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