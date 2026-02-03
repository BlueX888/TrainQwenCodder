class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
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

    // 设置键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 防止连续发射的冷却时间
    this.lastFireTime = 0;
    this.fireDelay = 200; // 毫秒

    // 创建碰撞检测
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
      fontFamily: 'Arial'
    });

    // 定时生成敌人
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 初始生成几个敌人
    for (let i = 0; i < 3; i++) {
      this.spawnEnemy();
    }
  }

  update(time, delta) {
    // 检测WASD键发射子弹
    if (time > this.lastFireTime + this.fireDelay) {
      if (this.keys.W.isDown) {
        this.fireBullet(0, -1);
        this.lastFireTime = time;
      } else if (this.keys.S.isDown) {
        this.fireBullet(0, 1);
        this.lastFireTime = time;
      } else if (this.keys.A.isDown) {
        this.fireBullet(-1, 0);
        this.lastFireTime = time;
      } else if (this.keys.D.isDown) {
        this.fireBullet(1, 0);
        this.lastFireTime = time;
      }
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });
  }

  fireBullet(dirX, dirY) {
    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      
      // 设置子弹速度
      const speed = 400;
      bullet.setVelocity(dirX * speed, dirY * speed);
    }
  }

  spawnEnemy() {
    // 随机在屏幕边缘生成敌人
    const side = Phaser.Math.Between(0, 3);
    let x, y;
    
    switch(side) {
      case 0: // 上
        x = Phaser.Math.Between(50, 750);
        y = 50;
        break;
      case 1: // 右
        x = 750;
        y = Phaser.Math.Between(50, 550);
        break;
      case 2: // 下
        x = Phaser.Math.Between(50, 750);
        y = 550;
        break;
      case 3: // 左
        x = 50;
        y = Phaser.Math.Between(50, 550);
        break;
    }

    const enemy = this.enemies.create(x, y, 'enemy');
    
    // 敌人朝向玩家移动
    this.physics.moveToObject(enemy, this.player, 80);
  }

  hitEnemy(bullet, enemy) {
    // 子弹击中敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    
    enemy.destroy();
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);
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

const game = new Phaser.Game(config);