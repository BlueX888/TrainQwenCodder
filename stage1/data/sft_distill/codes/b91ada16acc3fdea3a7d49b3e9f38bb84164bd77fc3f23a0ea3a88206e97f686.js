// Boss战游戏 - 击败黄色Boss
class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8;
    this.gameOver = false;
    this.bulletSpeed = 80;
  }

  preload() {
    // 创建玩家纹理（蓝色三角形）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(0, -20);
    playerGraphics.lineTo(-15, 20);
    playerGraphics.lineTo(15, 20);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建Boss纹理（黄色大圆）
    const bossGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bossGraphics.fillStyle(0xffcc00, 1);
    bossGraphics.fillCircle(0, 0, 40);
    // 添加眼睛
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillCircle(-15, -10, 8);
    bossGraphics.fillCircle(15, -10, 8);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建子弹纹理（红色小圆）
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xff3333, 1);
    bulletGraphics.fillCircle(0, 0, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.setBounce(1, 1);
    this.boss.setVelocity(100, 50);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.canShoot = true;
    this.shootDelay = 300;

    // 碰撞检测：子弹击中Boss
    this.physics.add.overlap(
      this.bullets,
      this.boss,
      this.hitBoss,
      null,
      this
    );

    // UI文本
    this.healthText = this.add.text(16, 16, `Boss Health: ${this.bossHealth}`, {
      fontSize: '24px',
      fill: '#fff',
      fontStyle: 'bold'
    });

    this.instructionText = this.add.text(400, 550, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5);

    // 胜利文本（初始隐藏）
    this.victoryText = this.add.text(400, 300, 'VICTORY!', {
      fontSize: '64px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
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
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
      this.shootBullet();
    }

    // 清理出界的子弹
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
      bullet.body.velocity.y = -this.bulletSpeed;
      
      this.canShoot = false;
      this.time.delayedCall(this.shootDelay, () => {
        this.canShoot = true;
      });
    }
  }

  hitBoss(bullet, boss) {
    // 销毁子弹
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.velocity.y = 0;

    // Boss扣血
    this.bossHealth--;
    this.healthText.setText(`Boss Health: ${this.bossHealth}`);

    // Boss受击闪烁效果
    boss.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      boss.clearTint();
    });

    // 检查是否胜利
    if (this.bossHealth <= 0) {
      this.victory();
    } else {
      // Boss加速
      const currentVel = boss.body.velocity;
      boss.setVelocity(currentVel.x * 1.1, currentVel.y * 1.1);
    }
  }

  victory() {
    this.gameOver = true;
    this.boss.setVelocity(0, 0);
    this.player.setVelocity(0, 0);
    
    // 显示胜利文本
    this.victoryText.setVisible(true);
    
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

    // 停止所有子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        bullet.setVelocity(0, 0);
      }
    });

    console.log('Victory! Boss defeated!');
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

// 启动游戏
const game = new Phaser.Game(config);