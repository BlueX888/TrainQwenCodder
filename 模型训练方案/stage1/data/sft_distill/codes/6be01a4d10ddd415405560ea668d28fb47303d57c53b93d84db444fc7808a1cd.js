class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 300 * 1.2; // 360
    this.enemySpeed = 300;
    this.distance = 0;
    this.collisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化状态信号
    window.__signals__ = {
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      distance: 0,
      collisionCount: 0,
      playerPosition: { x: 0, y: 0 },
      enemyPosition: { x: 0, y: 0 },
      gameTime: 0
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（从右上角开始）
    this.enemy = this.physics.add.sprite(700, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, '使用方向键移动 | 蓝色玩家速度: 360 | 橙色敌人速度: 300', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    console.log(JSON.stringify({
      event: 'game_start',
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed
    }));
  }

  update(time, delta) {
    // 重置玩家速度
    this.player.setVelocity(0);

    // 键盘控制玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalizedSpeed = this.playerSpeed / Math.sqrt(2);
      this.player.setVelocity(
        this.player.body.velocity.x > 0 ? normalizedSpeed : -normalizedSpeed,
        this.player.body.velocity.y > 0 ? normalizedSpeed : -normalizedSpeed
      );
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    this.distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新信息显示
    this.infoText.setText([
      `距离: ${Math.round(this.distance)}`,
      `碰撞次数: ${this.collisionCount}`,
      `游戏时间: ${Math.floor(time / 1000)}s`,
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `敌人位置: (${Math.round(this.enemy.x)}, ${Math.round(this.enemy.y)})`
    ]);

    // 更新状态信号
    window.__signals__ = {
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      distance: Math.round(this.distance),
      collisionCount: this.collisionCount,
      playerPosition: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      },
      enemyPosition: {
        x: Math.round(this.enemy.x),
        y: Math.round(this.enemy.y)
      },
      gameTime: Math.floor(time / 1000)
    };
  }

  handleCollision(player, enemy) {
    this.collisionCount++;
    
    // 碰撞后将敌人重置到随机位置
    const spawnX = Phaser.Math.Between(100, 700);
    const spawnY = Phaser.Math.Between(100, 500);
    enemy.setPosition(spawnX, spawnY);

    // 输出碰撞日志
    console.log(JSON.stringify({
      event: 'collision',
      collisionCount: this.collisionCount,
      playerPosition: { x: Math.round(player.x), y: Math.round(player.y) },
      enemyRespawn: { x: spawnX, y: spawnY },
      timestamp: Date.now()
    }));
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