class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 5;
    this.enemyIncrement = 2;
    this.enemiesRemaining = 0;
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.messageText.setOrigin(0.5);
    this.messageText.setVisible(false);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    // 计算当前关卡的敌人数量
    const enemyCount = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;
    this.enemiesRemaining = enemyCount;

    // 清空现有敌人
    this.enemies.clear(true, true);

    // 生成敌人（使用固定种子确保可预测性）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < enemyCount; i++) {
      // 使用简单的伪随机算法确保确定性
      const x = ((seed + i * 137) % 700) + 50;
      const y = ((seed + i * 211) % 500) + 50;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 给敌人随机速度（确定性）
      const vx = ((seed + i * 73) % 200) - 100;
      const vy = ((seed + i * 97) % 200) - 100;
      enemy.setVelocity(vx, vy);
    }

    // 更新UI
    this.updateUI();

    // 显示关卡开始信息
    this.messageText.setText(`Level ${this.currentLevel}`);
    this.messageText.setVisible(true);
    this.time.delayedCall(1500, () => {
      this.messageText.setVisible(false);
    });
  }

  hitEnemy(player, enemy) {
    // 消灭敌人
    enemy.destroy();
    this.enemiesRemaining--;

    // 更新UI
    this.updateUI();

    // 检查是否所有敌人都被消灭
    if (this.enemiesRemaining === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.currentLevel >= this.maxLevel) {
      // 游戏胜利
      this.messageText.setText('Victory! All Levels Complete!');
      this.messageText.setVisible(true);
      this.physics.pause();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.messageText.setText(`Level ${this.currentLevel - 1} Complete!`);
      this.messageText.setVisible(true);
      
      this.time.delayedCall(2000, () => {
        this.startLevel();
      });
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
  }

  update() {
    // 玩家移动控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
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

const game = new Phaser.Game(config);