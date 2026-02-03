// MenuScene - 游戏菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // 绘制背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, width, height);

    // 标题文本
    const title = this.add.text(width / 2, height / 3, 'COLLECT GAME', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 开始提示文本
    const startText = this.add.text(width / 2, height / 2, 'Press SPACE or Click to Start', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    startText.setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // 键盘输入
    this.input.keyboard.once('keydown-SPACE', () => {
      this.startGame();
    });

    // 鼠标点击
    this.input.once('pointerdown', () => {
      this.startGame();
    });

    // 添加说明文本
    const instructions = this.add.text(width / 2, height * 0.7, 
      'Use Arrow Keys to Move\nCollect 10 items to win!', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center'
    });
    instructions.setOrigin(0.5);
  }

  startGame() {
    this.scene.start('GameScene');
  }
}

// GameScene - 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.targetScore = 10;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillRect(0, 0, 20, 20);
    itemGraphics.generateTexture('item', 20, 20);
    itemGraphics.destroy();
  }

  create() {
    const { width, height } = this.cameras.main;

    // 重置分数
    this.score = 0;

    // 绘制背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0f1e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建玩家
    this.player = this.add.sprite(width / 2, height / 2, 'player');
    this.player.speed = 200;

    // 创建收集物组
    this.items = this.add.group();
    this.spawnItems();

    // 分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / ' + this.targetScore, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 游戏状态标记
    this.gameActive = true;
  }

  spawnItems() {
    const { width, height } = this.cameras.main;
    const padding = 50;
    
    // 使用固定种子生成位置
    for (let i = 0; i < this.targetScore; i++) {
      const x = padding + (i * 73) % (width - padding * 2);
      const y = padding + (i * 97) % (height - padding * 2);
      
      const item = this.add.sprite(x, y, 'item');
      item.setData('id', i);
      this.items.add(item);

      // 添加旋转动画
      this.tweens.add({
        targets: item,
        angle: 360,
        duration: 2000,
        repeat: -1
      });
    }
  }

  update(time, delta) {
    if (!this.gameActive) return;

    // 玩家移动
    const velocity = this.player.speed * (delta / 1000);

    if (this.cursors.left.isDown) {
      this.player.x -= velocity;
    }
    if (this.cursors.right.isDown) {
      this.player.x += velocity;
    }
    if (this.cursors.up.isDown) {
      this.player.y -= velocity;
    }
    if (this.cursors.down.isDown) {
      this.player.y += velocity;
    }

    // 边界检测
    const { width, height } = this.cameras.main;
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, width - 16);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, height - 16);

    // 碰撞检测
    this.items.getChildren().forEach(item => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        item.x, item.y
      );

      if (distance < 30) {
        this.collectItem(item);
      }
    });
  }

  collectItem(item) {
    // 移除物品
    item.destroy();
    
    // 增加分数
    this.score++;
    this.scoreText.setText('Score: ' + this.score + ' / ' + this.targetScore);

    // 检查是否胜利
    if (this.score >= this.targetScore) {
      this.gameWin();
    }
  }

  gameWin() {
    this.gameActive = false;

    // 显示胜利提示
    const { width, height } = this.cameras.main;
    const winText = this.add.text(width / 2, height / 2, 'YOU WIN!', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    winText.setOrigin(0.5);

    // 延迟后跳转到游戏结束场景
    this.time.delayedCall(2000, () => {
      this.scene.start('GameOverScene', { score: this.score });
    });
  }
}

// GameOverScene - 游戏结束场景
class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    // 接收传递的分数
    this.finalScore = data.score || 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // 绘制背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2a2a3e, 1);
    graphics.fillRect(0, 0, width, height);

    // 游戏结束标题
    const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    // 显示最终分数
    const scoreText = this.add.text(width / 2, height / 2, 'Final Score: ' + this.finalScore, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    scoreText.setOrigin(0.5);

    // 重新开始提示
    const restartText = this.add.text(width / 2, height * 0.65, 'Press SPACE to Restart', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });
    restartText.setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: restartText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // 返回菜单提示
    const menuText = this.add.text(width / 2, height * 0.75, 'Press M for Menu', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    menuText.setOrigin(0.5);

    // 键盘输入 - 重新开始
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    // 键盘输入 - 返回菜单
    this.input.keyboard.once('keydown-M', () => {
      this.scene.start('MenuScene');
    });

    // 鼠标点击重新开始
    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene, GameOverScene],
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出全局状态用于验证
window.gameState = {
  getCurrentScene: () => {
    return game.scene.scenes[0].scene.key;
  },
  getScore: () => {
    const gameScene = game.scene.getScene('GameScene');
    return gameScene ? gameScene.score : 0;
  }
};