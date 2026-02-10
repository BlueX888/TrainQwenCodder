class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.gameOver = false;
    this.survivalTime = 0;
    this.enemyCount = 0;
    this.playerSpeed = 300;
    this.enemySpeed = 360;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 定时生成敌人（每1秒生成一个）
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 添加游戏说明文本
    this.add.text(10, 10, 'Use Arrow Keys or A/D to move', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(10, 35, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 初始化信号对象
    window.__signals__ = {
      gameOver: false,
      survivalTime: 0,
      enemyCount: 0,
      playerX: 400,
      playerY: 550
    };

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
  }

  spawnEnemy() {
    if (this.gameOver) return;

    // 随机 X 位置（避免边缘）
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人向下速度为 360
    enemy.setVelocityY(this.enemySpeed);

    this.enemyCount++;

    console.log(JSON.stringify({
      event: 'enemy_spawn',
      x: x,
      enemyCount: this.enemyCount,
      timestamp: Date.now()
    }));
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) return;

    this.gameOver = true;
    
    // 停止物理系统
    this.physics.pause();
    
    // 停止敌人生成
    this.enemyTimer.remove();

    // 玩家变红表示游戏结束
    player.setTint(0xff0000);

    // 显示游戏结束文本
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    }).setOrigin(0.5);

    this.add.text(400, 370, `Survival Time: ${this.survivalTime.toFixed(1)}s`, {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 410, `Enemies Dodged: ${this.enemyCount}`, {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 更新信号
    window.__signals__.gameOver = true;

    console.log(JSON.stringify({
      event: 'game_over',
      survivalTime: this.survivalTime,
      enemyCount: this.enemyCount,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 更新存活时间
    this.survivalTime += delta / 1000;

    // 玩家移动控制
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });

    // 更新状态文本
    this.statusText.setText(
      `Time: ${this.survivalTime.toFixed(1)}s | Enemies: ${this.enemyCount}`
    );

    // 更新信号
    window.__signals__.survivalTime = parseFloat(this.survivalTime.toFixed(2));
    window.__signals__.enemyCount = this.enemyCount;
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
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
  scene: DodgeGameScene
};

new Phaser.Game(config);