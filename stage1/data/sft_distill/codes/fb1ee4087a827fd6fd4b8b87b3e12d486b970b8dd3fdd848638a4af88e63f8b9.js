class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemy = null;
    this.cursors = null;
    this.health = 100;
    this.survivalTime = 0;
    this.gameOver = false;
    this.collisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（左上角）
    this.enemy = this.physics.add.sprite(50, 50, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 添加文本显示
    this.healthText = this.add.text(16, 16, 'Health: 100', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.timeText = this.add.text(16, 46, 'Time: 0s', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 76, 'Status: Playing', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    // 初始化信号对象
    window.__signals__ = {
      health: this.health,
      survivalTime: 0,
      gameOver: false,
      collisionCount: 0,
      playerPosition: { x: 400, y: 300 },
      enemyPosition: { x: 50, y: 50 },
      distance: 0
    };

    console.log(JSON.stringify({
      type: 'game_start',
      playerSpeed: 144,
      enemySpeed: 120,
      initialHealth: this.health
    }));
  }

  handleCollision(player, enemy) {
    if (!this.gameOver) {
      this.health -= 10;
      this.collisionCount++;
      
      console.log(JSON.stringify({
        type: 'collision',
        health: this.health,
        collisionCount: this.collisionCount,
        time: this.survivalTime
      }));

      // 碰撞后敌人短暂后退
      this.physics.moveToObject(enemy, player, -200);
      this.time.delayedCall(200, () => {
        if (!this.gameOver) {
          enemy.body.velocity.set(0, 0);
        }
      });

      if (this.health <= 0) {
        this.gameOver = true;
        this.statusText.setText('Status: Game Over');
        this.statusText.setColor('#ff0000');
        
        console.log(JSON.stringify({
          type: 'game_over',
          survivalTime: this.survivalTime,
          collisionCount: this.collisionCount
        }));
      }
    }
  }

  update(time, delta) {
    if (this.gameOver) {
      this.player.body.velocity.set(0, 0);
      this.enemy.body.velocity.set(0, 0);
      return;
    }

    // 更新存活时间
    this.survivalTime = Math.floor(time / 1000);

    // 玩家移动控制（速度 120 * 1.2 = 144）
    const playerSpeed = 144;
    this.player.body.velocity.set(0, 0);

    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -playerSpeed;
    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x = playerSpeed;
    }

    if (this.cursors.up.isDown) {
      this.player.body.velocity.y = -playerSpeed;
    } else if (this.cursors.down.isDown) {
      this.player.body.velocity.y = playerSpeed;
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家（速度 120）
    const enemySpeed = 120;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);

    // 计算玩家与敌人的距离
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新显示文本
    this.healthText.setText(`Health: ${this.health}`);
    this.timeText.setText(`Time: ${this.survivalTime}s`);

    // 更新信号对象
    window.__signals__ = {
      health: this.health,
      survivalTime: this.survivalTime,
      gameOver: this.gameOver,
      collisionCount: this.collisionCount,
      playerPosition: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      },
      enemyPosition: {
        x: Math.round(this.enemy.x),
        y: Math.round(this.enemy.y)
      },
      distance: Math.round(distance),
      playerSpeed: Math.round(this.player.body.velocity.length()),
      enemySpeed: Math.round(this.enemy.body.velocity.length())
    };
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