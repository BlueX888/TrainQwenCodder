class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 15, 15, 15);
    playerGraphics.generateTexture('player', 30, 35);
    playerGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
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

    // 初始生成敌人
    this.spawnEnemies();

    // 定时生成敌人
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemies,
      callbackScope: this,
      loop: true
    });

    // 子弹与敌人碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 鼠标点击发射子弹
    this.input.on('pointerdown', (pointer) => {
      this.shootBullet(pointer);
    });

    // 显示击杀数文本
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '32px',
      fill: '#fff',
      fontStyle: 'bold'
    });
    this.killText.setScrollFactor(0);

    // 添加提示文本
    this.add.text(400, 300, 'Click to Shoot!', {
      fontSize: '24px',
      fill: '#fff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 移除超出屏幕的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 敌人缓慢下移
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active) {
        enemy.y += 0.5;
        // 移除超出屏幕的敌人
        if (enemy.y > 610) {
          enemy.setActive(false);
          enemy.setVisible(false);
        }
      }
    });
  }

  shootBullet(pointer) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 计算子弹方向（从玩家指向鼠标点击位置）
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );
      
      // 设置子弹速度（速度 300）
      this.physics.velocityFromRotation(angle, 300, bullet.body.velocity);
      
      // 旋转子弹朝向移动方向
      bullet.rotation = angle;
    }
  }

  spawnEnemies() {
    // 随机生成 2-4 个敌人
    const count = Phaser.Math.Between(2, 4);
    
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(-50, -150);
      
      const enemy = this.enemies.get(x, y);
      
      if (enemy) {
        enemy.setActive(true);
        enemy.setVisible(true);
        enemy.body.setVelocity(0, 0);
      }
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹和敌人都消失
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);
    
    enemy.setActive(false);
    enemy.setVisible(false);
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);
    
    // 添加击杀特效（简单的闪光）
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillCircle(enemy.x, enemy.y, 20);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      }
    });
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
  scene: GameScene
};

new Phaser.Game(config);