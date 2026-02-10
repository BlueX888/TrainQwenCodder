class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      key: 'enemy',
      repeat: 9,
      setXY: { x: 100, y: 100, stepX: 70 }
    });

    this.enemies.children.iterate((enemy) => {
      enemy.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(20, 50));
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 设置方向键
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 记录上次发射时间
    this.lastFired = 0;
    this.fireDelay = 250; // 发射间隔（毫秒）

    // 添加碰撞检测
    this.physics.add.collider(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 显示击杀数
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.killText.setScrollFactor(0);

    // 添加游戏说明
    this.add.text(16, 50, 'Use Arrow Keys to Shoot', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 检测方向键并发射子弹
    if (time > this.lastFired + this.fireDelay) {
      let bulletVelocity = null;

      if (this.cursors.left.isDown) {
        bulletVelocity = { x: -240, y: 0 };
      } else if (this.cursors.right.isDown) {
        bulletVelocity = { x: 240, y: 0 };
      } else if (this.cursors.up.isDown) {
        bulletVelocity = { x: 0, y: -240 };
      } else if (this.cursors.down.isDown) {
        bulletVelocity = { x: 0, y: 240 };
      }

      if (bulletVelocity) {
        this.fireBullet(bulletVelocity);
        this.lastFired = time;
      }
    }

    // 清理超出边界的子弹
    this.bullets.children.iterate((bullet) => {
      if (bullet && bullet.active) {
        if (bullet.x < -10 || bullet.x > 810 || bullet.y < -10 || bullet.y > 610) {
          bullet.destroy();
        }
      }
    });
  }

  fireBullet(velocity) {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocity(velocity.x, velocity.y);
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹击中敌人
    bullet.destroy();
    enemy.destroy();
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 如果所有敌人被消灭，重新生成
    if (this.enemies.countActive() === 0) {
      this.respawnEnemies();
    }
  }

  respawnEnemies() {
    // 重新生成敌人
    const positions = [
      { x: 100, y: 100 },
      { x: 170, y: 100 },
      { x: 240, y: 100 },
      { x: 310, y: 100 },
      { x: 380, y: 100 },
      { x: 450, y: 100 },
      { x: 520, y: 100 },
      { x: 590, y: 100 },
      { x: 660, y: 100 },
      { x: 730, y: 100 }
    ];

    positions.forEach((pos) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(20, 50));
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
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

const game = new Phaser.Game(config);

// 导出状态用于验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, getKillCount: () => game.scene.scenes[0].killCount };
}