class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
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

    // 生成初始敌人
    this.spawnEnemies(5);

    // 设置子弹与敌人的碰撞
    this.physics.add.collider(
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

    // 显示击杀数文本
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 定时生成新敌人
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemies,
      args: [1],
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    // 移动玩家跟随鼠标X轴
    const pointer = this.input.activePointer;
    if (pointer.x > 0 && pointer.x < 800) {
      this.player.x = Phaser.Math.Linear(this.player.x, pointer.x, 0.1);
    }

    // 移除超出屏幕的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 敌人移动逻辑
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active) {
        // 向下移动
        enemy.y += 1;
        
        // 左右摇摆
        enemy.x += Math.sin(time * 0.002 + enemy.getData('offset')) * 2;

        // 超出屏幕底部则移除
        if (enemy.y > 650) {
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
      
      // 计算子弹方向（从玩家指向鼠标位置）
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );
      
      // 设置子弹速度（速度为 80）
      const speed = 400;
      bullet.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      // 如果只想向上发射，使用以下代码替代上面的方向计算
      // bullet.setVelocityY(-400);
    }
  }

  spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(-100, -50);
      
      const enemy = this.enemies.get(x, y);
      
      if (enemy) {
        enemy.setActive(true);
        enemy.setVisible(true);
        enemy.setVelocity(0, 0);
        // 存储随机偏移用于摇摆运动
        enemy.setData('offset', Math.random() * Math.PI * 2);
      }
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    
    enemy.setActive(false);
    enemy.setVisible(false);
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 创建击杀特效（可选）
    const explosion = this.add.graphics();
    explosion.fillStyle(0xffa500, 1);
    explosion.fillCircle(enemy.x, enemy.y, 20);
    
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => {
        explosion.destroy();
      }
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
  scene: GameScene
};

new Phaser.Game(config);