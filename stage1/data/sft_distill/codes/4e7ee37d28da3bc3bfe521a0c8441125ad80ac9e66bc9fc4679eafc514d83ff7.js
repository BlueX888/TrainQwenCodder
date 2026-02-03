class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 可验证的状态信号
  }

  preload() {
    // 使用 Graphics 创建纹理，不依赖外部资源
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成初始敌人
    this.spawnEnemies();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 设置键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建击杀数文本
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    // 设置碰撞检测：子弹与敌人
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 定时生成新敌人
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemies,
      callbackScope: this,
      loop: true
    });

    // 添加游戏说明
    this.add.text(16, 560, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  spawnEnemies() {
    // 随机生成 3-5 个敌人
    const count = Phaser.Math.Between(3, 5);
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 250);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 设置敌人随机移动
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(50, 150)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  shootBullet() {
    // 从玩家位置发射子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-300); // 向上发射，速度 300
      
      // 子弹超出屏幕后自动销毁
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹命中敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 添加击中特效
    const hitEffect = this.add.graphics();
    hitEffect.fillStyle(0xffffff, 0.8);
    hitEffect.fillCircle(enemy.x, enemy.y, 20);
    this.tweens.add({
      targets: hitEffect,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => hitEffect.destroy()
    });
  }

  update(time, delta) {
    // 玩家移动控制
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

    // 空格键发射子弹（添加射击间隔）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shootBullet();
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);