class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.gameOver = false;
    this.survivalTime = 0;
    this.enemyCount = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 1000; // 每秒生成一个敌人
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 生成敌人纹理（绿色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 20
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 添加游戏说明文本
    this.add.text(10, 10, '使用左右箭头键移动，躲避绿色敌人', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(10, 35, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 初始化信号
    this.updateSignals();
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime += delta;

    // 玩家移动控制
    const playerSpeed = 300;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    // 定时生成敌人
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 620) {
        this.enemies.killAndHide(enemy);
        enemy.body.enable = false;
      }
    });

    // 更新状态文本
    this.statusText.setText(
      `存活时间: ${(this.survivalTime / 1000).toFixed(1)}s | 敌人数: ${this.enemyCount}`
    );

    // 更新信号
    this.updateSignals();
  }

  spawnEnemy() {
    // 随机 x 坐标
    const x = Phaser.Math.Between(30, 770);
    
    // 从对象池获取或创建新敌人
    const enemy = this.enemies.get(x, -30, 'enemy');
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.body.enable = true;
      enemy.setVelocityY(200); // 设置下落速度为 200
      this.enemyCount++;
    }
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    
    // 停止物理系统
    this.physics.pause();
    
    // 玩家变红
    this.player.setTint(0xff0000);
    
    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const survivalText = this.add.text(400, 370, 
      `存活时间: ${(this.survivalTime / 1000).toFixed(1)}秒`, {
      fontSize: '24px',
      fill: '#ffffff'
    });
    survivalText.setOrigin(0.5);

    const restartText = this.add.text(400, 410, '刷新页面重新开始', {
      fontSize: '20px',
      fill: '#ffff00'
    });
    restartText.setOrigin(0.5);

    // 更新最终信号
    this.updateSignals();
    
    // 输出游戏结束日志
    console.log(JSON.stringify({
      event: 'gameOver',
      survivalTime: this.survivalTime,
      enemyCount: this.enemyCount
    }));
  }

  updateSignals() {
    window.__signals__ = {
      gameState: this.gameOver ? 'gameOver' : 'playing',
      survivalTime: Math.floor(this.survivalTime),
      enemyCount: this.enemyCount,
      playerX: this.player ? Math.floor(this.player.x) : 0,
      playerY: this.player ? Math.floor(this.player.y) : 0,
      activeEnemies: this.enemies ? this.enemies.countActive(true) : 0
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: DodgeGameScene
};

const game = new Phaser.Game(config);