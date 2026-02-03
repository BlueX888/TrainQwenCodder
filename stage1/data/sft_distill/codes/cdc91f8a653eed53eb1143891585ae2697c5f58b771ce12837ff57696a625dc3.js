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

    // 生成初始敌人
    this.spawnEnemies(8);

    // 设置WASD键输入
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 防止按键重复触发的冷却时间
    this.lastFireTime = 0;
    this.fireDelay = 200; // 毫秒

    // 设置碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 显示击杀数文本
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
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
    // 检测WASD按键并发射子弹
    if (time > this.lastFireTime + this.fireDelay) {
      if (this.keys.w.isDown) {
        this.fireBullet(0, -1); // 向上
        this.lastFireTime = time;
      } else if (this.keys.s.isDown) {
        this.fireBullet(0, 1); // 向下
        this.lastFireTime = time;
      } else if (this.keys.a.isDown) {
        this.fireBullet(-1, 0); // 向左
        this.lastFireTime = time;
      } else if (this.keys.d.isDown) {
        this.fireBullet(1, 0); // 向右
        this.lastFireTime = time;
      }
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -10 || bullet.x > 810 || 
            bullet.y < -10 || bullet.y > 610) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 如果敌人数量少于3个，补充敌人
    if (this.enemies.countActive(true) < 3) {
      this.spawnEnemies(2);
    }
  }

  fireBullet(dirX, dirY) {
    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      
      // 设置子弹速度
      bullet.setVelocity(dirX * 200, dirY * 200);
      
      // 设置子弹生命周期，3秒后自动回收
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });
    }
  }

  spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
      // 随机生成敌人位置，避免与玩家太近
      let x, y;
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
      } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 150);

      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹击中敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    
    enemy.destroy();
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 创建击杀特效
    const hitEffect = this.add.graphics();
    hitEffect.fillStyle(0xffffff, 0.8);
    hitEffect.fillCircle(enemy.x, enemy.y, 15);
    
    this.tweens.add({
      targets: hitEffect,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => {
        hitEffect.destroy();
      }
    });
  }
}

// Phaser游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);