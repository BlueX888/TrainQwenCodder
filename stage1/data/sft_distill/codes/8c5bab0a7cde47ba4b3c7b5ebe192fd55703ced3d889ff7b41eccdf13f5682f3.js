class ShootingGame extends Phaser.Scene {
  constructor() {
    super('ShootingGame');
    this.killCount = 0; // 可验证的状态信号
  }

  preload() {
    // 创建玩家纹理（三角形飞船）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(0, -20);
    playerGraphics.lineTo(-15, 20);
    playerGraphics.lineTo(15, 20);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(0, 0, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 20
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.shootBullet(pointer);
      }
    });

    // 创建击杀数显示文本
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });
    this.killText.setDepth(100);

    // 定时生成敌人
    this.enemyTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 初始生成几个敌人
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 500, () => this.spawnEnemy());
    }
  }

  update(time, delta) {
    // 移除超出屏幕的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 移除超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active && enemy.y > 610) {
        enemy.setActive(false);
        enemy.setVisible(false);
      }
    });

    // 让敌人向下移动
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active) {
        enemy.y += 1;
      }
    });
  }

  shootBullet(pointer) {
    // 从玩家位置发射子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 计算子弹朝向鼠标点击位置的方向
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );
      
      // 设置子弹速度（速度为 160）
      const velocityX = Math.cos(angle) * 160;
      const velocityY = Math.sin(angle) * 160;
      
      bullet.setVelocity(velocityX, velocityY);
      
      // 旋转子弹朝向移动方向
      bullet.setRotation(angle);
    }
  }

  spawnEnemy() {
    // 在屏幕顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.get(x, -20);
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setVelocity(0, 0); // 在 update 中手动控制移动
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹命中敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    
    enemy.setActive(false);
    enemy.setVisible(false);
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);
    
    // 简单的击中效果（闪烁）
    const flash = this.add.circle(enemy.x, enemy.y, 30, 0xffffff, 0.8);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => flash.destroy()
    });
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
  scene: ShootingGame
};

new Phaser.Game(config);