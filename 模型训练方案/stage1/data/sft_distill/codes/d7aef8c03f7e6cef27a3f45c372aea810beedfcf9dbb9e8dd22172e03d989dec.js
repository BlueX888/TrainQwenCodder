// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  currentScene: 'MenuScene',
  sceneHistory: [],
  buttonClicks: 0,
  gameStarted: false,
  score: 0
};

// 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 更新信号
    window.__signals__.currentScene = 'MenuScene';
    window.__signals__.sceneHistory.push({
      scene: 'MenuScene',
      timestamp: Date.now()
    });

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题文字
    const titleText = this.add.text(400, 150, '游戏菜单', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 创建黄色按钮背景
    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0xffff00, 1); // 黄色
    buttonGraphics.fillRoundedRect(250, 300, 300, 80, 10);
    
    // 添加按钮边框
    buttonGraphics.lineStyle(4, 0xffa500, 1);
    buttonGraphics.strokeRoundedRect(250, 300, 300, 80, 10);

    // 创建按钮文字
    const buttonText = this.add.text(400, 340, '开始游戏', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const buttonZone = this.add.zone(400, 340, 300, 80);
    buttonZone.setInteractive({ useHandCursor: true });

    // 鼠标悬停效果
    buttonZone.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xffcc00, 1); // 悬停时颜色变深
      buttonGraphics.fillRoundedRect(250, 300, 300, 80, 10);
      buttonGraphics.lineStyle(4, 0xff8800, 1);
      buttonGraphics.strokeRoundedRect(250, 300, 300, 80, 10);
    });

    buttonZone.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xffff00, 1); // 恢复原色
      buttonGraphics.fillRoundedRect(250, 300, 300, 80, 10);
      buttonGraphics.lineStyle(4, 0xffa500, 1);
      buttonGraphics.strokeRoundedRect(250, 300, 300, 80, 10);
    });

    // 点击按钮切换到游戏场景
    buttonZone.on('pointerdown', () => {
      // 更新信号
      window.__signals__.buttonClicks++;
      window.__signals__.gameStarted = true;
      
      console.log(JSON.stringify({
        event: 'button_click',
        action: 'start_game',
        timestamp: Date.now(),
        clicks: window.__signals__.buttonClicks
      }));

      // 按钮按下效果
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xcccc00, 1);
      buttonGraphics.fillRoundedRect(250, 300, 300, 80, 10);
      buttonGraphics.lineStyle(4, 0xff6600, 1);
      buttonGraphics.strokeRoundedRect(250, 300, 300, 80, 10);

      // 延迟切换场景，让玩家看到按下效果
      this.time.delayedCall(150, () => {
        this.scene.start('GameScene');
      });
    });

    // 添加提示文字
    const hintText = this.add.text(400, 500, '点击黄色按钮开始游戏', {
      fontSize: '20px',
      color: '#95a5a6'
    });
    hintText.setOrigin(0.5);
  }

  update(time, delta) {
    // MenuScene 不需要持续更新逻辑
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.player = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 更新信号
    window.__signals__.currentScene = 'GameScene';
    window.__signals__.sceneHistory.push({
      scene: 'GameScene',
      timestamp: Date.now()
    });
    window.__signals__.score = 0;

    // 创建游戏背景
    const bg = this.add.graphics();
    bg.fillStyle(0x34495e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    const titleText = this.add.text(400, 50, '游戏场景', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 创建玩家（使用 Graphics 绘制）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(0, 0, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');

    // 创建分数显示
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 添加点击增加分数的交互
    this.input.on('pointerdown', (pointer) => {
      // 排除返回按钮区域
      if (pointer.y > 520) return;

      this.score += 10;
      window.__signals__.score = this.score;
      this.scoreText.setText('Score: ' + this.score);

      console.log(JSON.stringify({
        event: 'score_update',
        score: this.score,
        timestamp: Date.now()
      }));

      // 玩家移动到点击位置
      this.tweens.add({
        targets: this.player,
        x: pointer.x,
        y: pointer.y,
        duration: 300,
        ease: 'Power2'
      });
    });

    // 创建返回菜单按钮
    const backButtonGraphics = this.add.graphics();
    backButtonGraphics.fillStyle(0xe74c3c, 1);
    backButtonGraphics.fillRoundedRect(300, 540, 200, 50, 8);
    backButtonGraphics.lineStyle(3, 0xc0392b, 1);
    backButtonGraphics.strokeRoundedRect(300, 540, 200, 50, 8);

    const backButtonText = this.add.text(400, 565, '返回菜单', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    backButtonText.setOrigin(0.5);

    // 创建返回按钮交互区域
    const backButtonZone = this.add.zone(400, 565, 200, 50);
    backButtonZone.setInteractive({ useHandCursor: true });

    backButtonZone.on('pointerover', () => {
      backButtonGraphics.clear();
      backButtonGraphics.fillStyle(0xff6b6b, 1);
      backButtonGraphics.fillRoundedRect(300, 540, 200, 50, 8);
      backButtonGraphics.lineStyle(3, 0xc0392b, 1);
      backButtonGraphics.strokeRoundedRect(300, 540, 200, 50, 8);
    });

    backButtonZone.on('pointerout', () => {
      backButtonGraphics.clear();
      backButtonGraphics.fillStyle(0xe74c3c, 1);
      backButtonGraphics.fillRoundedRect(300, 540, 200, 50, 8);
      backButtonGraphics.lineStyle(3, 0xc0392b, 1);
      backButtonGraphics.strokeRoundedRect(300, 540, 200, 50, 8);
    });

    backButtonZone.on('pointerdown', () => {
      console.log(JSON.stringify({
        event: 'back_to_menu',
        finalScore: this.score,
        timestamp: Date.now()
      }));

      // 重置分数
      this.score = 0;
      window.__signals__.score = 0;
      window.__signals__.gameStarted = false;

      this.scene.start('MenuScene');
    });

    // 添加游戏说明
    const instructionText = this.add.text(400, 150, '点击屏幕增加分数并移动绿色圆球', {
      fontSize: '18px',
      color: '#ecf0f1'
    });
    instructionText.setOrigin(0.5);
  }

  update(time, delta) {
    // 可以添加持续的游戏逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene], // MenuScene 作为初始场景
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始化日志
console.log(JSON.stringify({
  event: 'game_initialized',
  scenes: ['MenuScene', 'GameScene'],
  timestamp: Date.now()
}));