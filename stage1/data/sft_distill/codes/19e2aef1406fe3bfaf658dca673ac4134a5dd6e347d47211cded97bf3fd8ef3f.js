// 游戏状态信号
window.__signals__ = {
  playerPosition: { x: 0, y: 0 },
  enemyPosition: { x: 0, y: 0 },
  distance: 0,
  collisionCount: 0,
  isPlayerCaught: false,
  gameTime: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemy = null;
    this.cursors = null;
    this.playerSpeed = 80 * 1.2; // 96
    this.enemySpeed = 80;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（随机位置，距离玩家较远）
    const startX = Phaser.Math.Between(100, 700);
    const startY = Phaser.Math.Between(100, 500);
    this.enemy = this.physics.add.sprite(startX, startY, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCollision, null, this);

    // 添加说明文字
    this.add.text(10, 10, 'Arrow Keys to Move\nBlue: Player (Speed 96)\nGreen: Enemy (Speed 80)', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 添加距离显示文字
    this.distanceText = this.add.text(10, 100, '', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    console.log(JSON.stringify({
      event: 'game_started',
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      playerPos: { x: this.player.x, y: this.player.y },
      enemyPos: { x: this.enemy.x, y: this.enemy.y }
    }));
  }

  update(time, delta) {
    // 更新游戏时间
    window.__signals__.gameTime = time;

    // 重置玩家速度
    this.player.setVelocity(0);

    // 处理玩家输入
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
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    // 更新信号
    window.__signals__.playerPosition = { x: this.player.x, y: this.player.y };
    window.__signals__.enemyPosition = { x: this.enemy.x, y: this.enemy.y };
    window.__signals__.distance = Math.round(distance);

    // 更新距离显示
    this.distanceText.setText(`Distance: ${Math.round(distance)}\nCollisions: ${window.__signals__.collisionCount}`);

    // 每秒输出一次状态日志
    if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
      console.log(JSON.stringify({
        event: 'game_state',
        time: Math.floor(time / 1000),
        distance: Math.round(distance),
        playerPos: window.__signals__.playerPosition,
        enemyPos: window.__signals__.enemyPosition,
        collisions: window.__signals__.collisionCount
      }));
    }
  }

  onCollision(player, enemy) {
    // 碰撞处理
    window.__signals__.collisionCount++;
    window.__signals__.isPlayerCaught = true;

    // 闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        player.alpha = 1;
        window.__signals__.isPlayerCaught = false;
      }
    });

    // 输出碰撞日志
    console.log(JSON.stringify({
      event: 'collision',
      collisionCount: window.__signals__.collisionCount,
      position: { x: player.x, y: player.y },
      time: window.__signals__.gameTime
    }));

    // 将敌人推开一点
    const angle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
    enemy.x += Math.cos(angle) * 50;
    enemy.y += Math.sin(angle) * 50;
  }
}

// 游戏配置
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

// 启动游戏
new Phaser.Game(config);