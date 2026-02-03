class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 可验证的状态信号
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
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
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy'
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

    // 设置WASD键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 防止连续发射的冷却时间
    this.shootCooldown = 0;

    // 碰撞检测：子弹与敌人
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 显示击杀数
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.killText.setDepth(100);

    // 显示操作提示
    this.add.text(16, 50, 'Press WASD to shoot', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
  }

  update(time, delta) {
    // 更新冷却时间
    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta;
    }

    // 检测WASD按键发射子弹
    if (this.shootCooldown <= 0) {
      if (this.keyW.isDown) {
        this.shootBullet(0, -1); // 向上
        this.shootCooldown = 200;
      } else if (this.keyS.isDown) {
        this.shootBullet(0, 1); // 向下
        this.shootCooldown = 200;
      } else if (this.keyA.isDown) {
        this.shootBullet(-1, 0); // 向左
        this.shootCooldown = 200;
      } else if (this.keyD.isDown) {
        this.shootBullet(1, 0); // 向右
        this.shootCooldown = 200;
      }
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -20 || bullet.x > 820 || bullet.y < -20 || bullet.y > 620) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 敌人随机移动
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        // 简单的追踪玩家逻辑
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );
        enemy.setVelocity(
          Math.cos(angle) * 50,
          Math.sin(angle) * 50
        );
      }
    });
  }

  shootBullet(dirX, dirY) {
    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocity(dirX * 160, dirY * 160);
      
      // 设置子弹生命周期
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });
    }
  }

  spawnEnemies() {
    // 随机生成2-4个敌人
    const count = Phaser.Math.Between(2, 4);
    
    for (let i = 0; i < count; i++) {
      // 随机位置（在边缘生成）
      let x, y;
      const edge = Phaser.Math.Between(0, 3);
      
      switch(edge) {
        case 0: // 上边
          x = Phaser.Math.Between(0, 800);
          y = -30;
          break;
        case 1: // 右边
          x = 830;
          y = Phaser.Math.Between(0, 600);
          break;
        case 2: // 下边
          x = Phaser.Math.Between(0, 800);
          y = 630;
          break;
        case 3: // 左边
          x = -30;
          y = Phaser.Math.Between(0, 600);
          break;
      }
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
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
    
    // 击杀特效（简单的闪光）
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillCircle(enemy.x, enemy.y, 20);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
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
  backgroundColor: '#2d2d2d',
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