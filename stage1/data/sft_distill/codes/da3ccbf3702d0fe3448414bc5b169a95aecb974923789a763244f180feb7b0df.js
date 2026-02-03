class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 80 * 1.2; // 96
    this.enemySpeed = 80;
    this.gameState = {
      playerPosition: { x: 0, y: 0 },
      enemyPosition: { x: 0, y: 0 },
      distanceToEnemy: 0,
      caught: false,
      escapeTime: 0,
      collisionCount: 0
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（紫色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9900ff, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（在左上角开始）
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.onCaught,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加状态文本
    this.statusText = this.add.text(10, 50, '', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化全局信号
    window.__signals__ = this.gameState;

    console.log(JSON.stringify({
      event: 'game_start',
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed
    }));
  }

  onCaught(player, enemy) {
    this.gameState.caught = true;
    this.gameState.collisionCount++;
    
    console.log(JSON.stringify({
      event: 'player_caught',
      collisionCount: this.gameState.collisionCount,
      escapeTime: this.gameState.escapeTime
    }));

    // 重置位置
    this.player.setPosition(400, 300);
    this.enemy.setPosition(100, 100);
    this.gameState.escapeTime = 0;
    
    // 短暂延迟后重置状态
    this.time.delayedCall(500, () => {
      this.gameState.caught = false;
    });
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
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 更新游戏状态
    this.gameState.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    this.gameState.enemyPosition = {
      x: Math.round(this.enemy.x),
      y: Math.round(this.enemy.y)
    };

    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );
    this.gameState.distanceToEnemy = Math.round(distance);

    // 累计逃脱时间（毫秒）
    if (!this.gameState.caught) {
      this.gameState.escapeTime += delta;
    }

    // 更新显示文本
    this.infoText.setText(
      `Player Speed: ${this.playerSpeed} | Enemy Speed: ${this.enemySpeed}\n` +
      `Use Arrow Keys to Move`
    );

    this.statusText.setText(
      `Distance: ${this.gameState.distanceToEnemy}px\n` +
      `Escape Time: ${(this.gameState.escapeTime / 1000).toFixed(1)}s\n` +
      `Caught: ${this.gameState.collisionCount} times\n` +
      `Status: ${this.gameState.caught ? 'CAUGHT!' : 'Escaping...'}`
    );

    // 每5秒输出一次状态日志
    if (Math.floor(time / 5000) > Math.floor((time - delta) / 5000)) {
      console.log(JSON.stringify({
        event: 'status_update',
        time: Math.floor(time / 1000),
        ...this.gameState
      }));
    }
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