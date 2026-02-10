class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0; // 状态信号：存活时间
    this.isCaught = false; // 状态信号：是否被抓到
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

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.playerSpeed = 240 * 1.2; // 288

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemySpeed = 240;

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCatch, null, this);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(400, 550, '使用 WASD 或方向键移动，躲避灰色敌人！', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 重置计时器
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.isCaught) {
      return;
    }

    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);

    // 玩家移动控制
    this.player.setVelocity(0);

    let moveX = 0;
    let moveY = 0;

    // 检测方向键或 WASD
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      moveX = -1;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      moveX = 1;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      moveY = -1;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      moveY = 1;
    }

    // 归一化对角线移动速度
    if (moveX !== 0 && moveY !== 0) {
      const normalizedSpeed = this.playerSpeed / Math.sqrt(2);
      this.player.setVelocity(moveX * normalizedSpeed, moveY * normalizedSpeed);
    } else {
      this.player.setVelocity(moveX * this.playerSpeed, moveY * this.playerSpeed);
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 更新状态显示
    this.statusText.setText(
      `存活时间: ${this.survivalTime}秒\n` +
      `玩家速度: ${this.playerSpeed}\n` +
      `敌人速度: ${this.enemySpeed}\n` +
      `距离: ${Math.floor(Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.enemy.x, this.enemy.y
      ))}`
    );
  }

  onCatch() {
    if (this.isCaught) {
      return;
    }

    this.isCaught = true;
    
    // 停止所有移动
    this.player.setVelocity(0);
    this.enemy.setVelocity(0);

    // 显示游戏结束信息
    const gameOverText = this.add.text(400, 300, 
      `被抓住了！\n存活时间: ${this.survivalTime}秒\n\n点击重新开始`, {
      fontSize: '32px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      align: 'center'
    }).setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });

    console.log(`游戏结束 - 存活时间: ${this.survivalTime}秒, 被抓住: ${this.isCaught}`);
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
  scene: GameScene
};

new Phaser.Game(config);