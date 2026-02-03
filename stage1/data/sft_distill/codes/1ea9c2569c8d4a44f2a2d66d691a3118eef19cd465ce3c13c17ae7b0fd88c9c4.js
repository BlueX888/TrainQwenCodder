class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8;
    this.maxBossHealth = 8;
    this.gameOver = false;
    this.victory = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 40, 30);
    playerGraphics.generateTexture('player', 40, 30);
    playerGraphics.destroy();

    // 创建Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff69b4, 1);
    bossGraphics.fillCircle(60, 60, 60);
    bossGraphics.generateTexture('boss', 120, 120);
    bossGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 150, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.setVelocityX(100);

    // Boss左右移动逻辑
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject === this.boss) {
        this.boss.setVelocityX(-this.boss.body.velocity.x);
      }
    });
    this.boss.body.onWorldBounds = true;

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 子弹与Boss碰撞检测
    this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, null, this);

    // UI文字
    this.healthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    // Boss血条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.8);
    this.healthBarBg.fillRect(250, 50, 300, 20);

    // Boss血条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 胜利文字（初始隐藏）
    this.victoryText = this.add.text(400, 300, 'VICTORY!', {
      fontSize: '64px',
      fill: '#00ff00',
      fontStyle: 'bold'
    });
    this.victoryText.setOrigin(0.5);
    this.victoryText.setVisible(false);

    // 游戏说明
    this.add.text(16, 560, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '16px',
      fill: '#fff'
    });
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

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 发射子弹（空格键，冷却时间200ms）
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.shootBullet();
      this.lastFired = time;
    }

    // 移除超出屏幕的子弹
    this.bullets.children.entries.forEach((bullet) => {
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
      bullet.body.velocity.y = -80; // 子弹速度80
    }
  }

  hitBoss(bullet, boss) {
    // 子弹击中Boss
    bullet.setActive(false);
    bullet.setVisible(false);

    // Boss扣血
    this.bossHealth--;
    this.healthText.setText(`Boss HP: ${this.bossHealth}/${this.maxBossHealth}`);
    this.updateHealthBar();

    // Boss闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    // 检查Boss是否被击败
    if (this.bossHealth <= 0) {
      this.winGame();
    }
  }

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercent = this.bossHealth / this.maxBossHealth;
    const barWidth = 300 * healthPercent;
    
    // 根据血量变色
    let color = 0x00ff00; // 绿色
    if (healthPercent < 0.3) {
      color = 0xff0000; // 红色
    } else if (healthPercent < 0.6) {
      color = 0xffaa00; // 橙色
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(250, 50, barWidth, 20);
  }

  winGame() {
    this.gameOver = true;
    this.victory = true;

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
    this.player.setVelocity(0, 0);

    // 清除所有子弹
    this.bullets.clear(true, true);

    console.log('Victory! Boss defeated!');
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