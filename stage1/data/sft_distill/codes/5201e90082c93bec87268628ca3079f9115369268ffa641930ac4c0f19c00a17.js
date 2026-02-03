class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8;
    this.maxBossHealth = 8;
    this.gameOver = false;
    this.bulletSpeed = 80;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 20, 15, 20);
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建 Boss 纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff69b4, 1); // 粉色
    bossGraphics.fillCircle(0, 0, 40);
    bossGraphics.fillStyle(0xff1493, 1);
    bossGraphics.fillCircle(-15, -10, 10);
    bossGraphics.fillCircle(15, -10, 10);
    bossGraphics.generateTexture('boss', 100, 100);
    bossGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 6, 12);
    bulletGraphics.generateTexture('bullet', 6, 12);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 Boss
    this.boss = this.physics.add.sprite(400, 150, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocityX(100);

    // Boss 移动逻辑（左右移动）
    this.boss.body.onWorldBounds = true;
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject === this.boss) {
        this.boss.body.setVelocityX(-this.boss.body.velocity.x);
      }
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测：子弹击中 Boss
    this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, null, this);

    // 创建血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.8);
    this.healthBarBg.fillRect(250, 50, 300, 30);

    // 创建血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 血量文字
    this.healthText = this.add.text(400, 65, `Boss HP: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 胜利文字（初始隐藏）
    this.victoryText = this.add.text(400, 300, 'VICTORY!', {
      fontSize: '64px',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);

    // 提示文字
    this.add.text(400, 580, 'Arrow Keys: Move | Space: Fire', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);
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

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    } else {
      this.player.setVelocityY(0);
    }

    // 发射子弹（限制射速：每 300ms 一次）
    if (this.fireKey.isDown && time > this.lastFired + 300) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -20) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 30);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocityY(-this.bulletSpeed);
    }
  }

  hitBoss(bullet, boss) {
    // 销毁子弹
    bullet.setActive(false);
    bullet.setVisible(false);

    // Boss 扣血
    this.bossHealth--;
    this.updateHealthBar();
    this.healthText.setText(`Boss HP: ${this.bossHealth}/${this.maxBossHealth}`);

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

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercent = this.bossHealth / this.maxBossHealth;
    const barWidth = 290 * healthPercent;
    
    // 根据血量显示不同颜色
    let color = 0x00ff00; // 绿色
    if (healthPercent < 0.3) {
      color = 0xff0000; // 红色
    } else if (healthPercent < 0.6) {
      color = 0xffaa00; // 橙色
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(255, 55, barWidth, 20);
  }

  victory() {
    this.gameOver = true;
    
    // 停止 Boss 移动
    this.boss.body.setVelocity(0, 0);
    
    // Boss 爆炸效果（缩放动画）
    this.tweens.add({
      targets: this.boss,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.boss.destroy();
      }
    });

    // 显示胜利文字
    this.victoryText.setVisible(true);
    this.tweens.add({
      targets: this.victoryText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 停止玩家移动
    this.player.body.setVelocity(0, 0);
  }
}

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

new Phaser.Game(config);