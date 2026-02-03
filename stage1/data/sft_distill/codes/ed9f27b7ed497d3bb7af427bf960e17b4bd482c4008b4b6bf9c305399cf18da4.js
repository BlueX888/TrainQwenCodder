const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态变量
let currentState = 'idle';
let player;
let stateText;
let keyI, keyR;

function preload() {
  // 创建 idle 状态的纹理帧（2帧：稍微变化的红色方块）
  const graphics = this.add.graphics();
  
  // Idle Frame 1 - 较小的红色方块
  graphics.clear();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 48, 64);
  graphics.fillStyle(0xaa0000, 1);
  graphics.fillRect(12, 16, 24, 8); // 眼睛
  graphics.generateTexture('idle1', 48, 64);
  
  // Idle Frame 2 - 稍微变大（呼吸效果）
  graphics.clear();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 52, 66);
  graphics.fillStyle(0xaa0000, 1);
  graphics.fillRect(14, 18, 24, 8);
  graphics.generateTexture('idle2', 52, 66);
  
  // Run Frame 1 - 倾斜的红色方块
  graphics.clear();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 8, 48, 56);
  graphics.fillStyle(0xaa0000, 1);
  graphics.fillRect(12, 20, 24, 8);
  graphics.fillStyle(0xff6666, 1); // 腿部动作
  graphics.fillRect(8, 48, 12, 16);
  graphics.fillRect(28, 52, 12, 12);
  graphics.generateTexture('run1', 48, 64);
  
  // Run Frame 2 - 另一个倾斜角度
  graphics.clear();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 4, 48, 60);
  graphics.fillStyle(0xaa0000, 1);
  graphics.fillRect(12, 16, 24, 8);
  graphics.fillStyle(0xff6666, 1); // 腿部动作（交替）
  graphics.fillRect(28, 48, 12, 16);
  graphics.fillRect(8, 52, 12, 12);
  graphics.generateTexture('run2', 48, 64);
  
  // Run Frame 3 - 中间姿势
  graphics.clear();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 48, 64);
  graphics.fillStyle(0xaa0000, 1);
  graphics.fillRect(12, 16, 24, 8);
  graphics.fillStyle(0xff6666, 1);
  graphics.fillRect(18, 52, 12, 12);
  graphics.generateTexture('run3', 48, 64);
  
  graphics.destroy();
}

function create() {
  // 创建角色精灵
  player = this.add.sprite(400, 300, 'idle1');
  player.setScale(2);
  
  // 创建 idle 动画（慢速呼吸效果）
  this.anims.create({
    key: 'idle_anim',
    frames: [
      { key: 'idle1' },
      { key: 'idle2' },
      { key: 'idle1' }
    ],
    frameRate: 2,
    repeat: -1
  });
  
  // 创建 run 动画（快速跑步效果）
  this.anims.create({
    key: 'run_anim',
    frames: [
      { key: 'run1' },
      { key: 'run2' },
      { key: 'run3' },
      { key: 'run2' }
    ],
    frameRate: 10,
    repeat: -1
  });
  
  // 默认播放 idle 动画
  player.play('idle_anim');
  
  // 创建状态显示文本
  stateText = this.add.text(400, 100, 'State: IDLE', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 20, y: 10 }
  });
  stateText.setOrigin(0.5);
  
  // 创建提示文本
  this.add.text(400, 550, 'Press [I] for IDLE  |  Press [R] for RUN', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 设置键盘输入
  keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
  keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  
  // 监听按键按下事件
  keyI.on('down', () => {
    switchState(this, 'idle');
  });
  
  keyR.on('down', () => {
    switchState(this, 'run');
  });
  
  // 添加状态指示器（颜色条）
  this.stateIndicator = this.add.graphics();
  updateStateIndicator(this);
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 例如：根据状态改变角色位置等
  if (currentState === 'run') {
    // 跑步状态下轻微晃动
    player.y = 300 + Math.sin(time / 100) * 5;
  } else {
    // idle 状态下保持稳定
    player.y = 300;
  }
}

function switchState(scene, newState) {
  if (currentState === newState) {
    return; // 已经是该状态，无需切换
  }
  
  currentState = newState;
  
  if (newState === 'idle') {
    player.play('idle_anim');
    stateText.setText('State: IDLE');
    stateText.setStyle({ color: '#ffffff' });
    
    // Tween 效果：缩小回正常大小
    scene.tweens.add({
      targets: player,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      ease: 'Back.out'
    });
  } else if (newState === 'run') {
    player.play('run_anim');
    stateText.setText('State: RUN');
    stateText.setStyle({ color: '#ffff00' });
    
    // Tween 效果：稍微放大表示活跃
    scene.tweens.add({
      targets: player,
      scaleX: 2.2,
      scaleY: 2.2,
      duration: 300,
      ease: 'Back.out'
    });
  }
  
  updateStateIndicator(scene);
}

function updateStateIndicator(scene) {
  scene.stateIndicator.clear();
  
  if (currentState === 'idle') {
    // 蓝色指示器
    scene.stateIndicator.fillStyle(0x0088ff, 1);
    scene.stateIndicator.fillRect(350, 120, 100, 20);
  } else if (currentState === 'run') {
    // 黄色指示器
    scene.stateIndicator.fillStyle(0xffff00, 1);
    scene.stateIndicator.fillRect(350, 120, 100, 20);
    
    // 添加闪烁效果
    scene.tweens.add({
      targets: scene.stateIndicator,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: 2
    });
  }
}

new Phaser.Game(config);